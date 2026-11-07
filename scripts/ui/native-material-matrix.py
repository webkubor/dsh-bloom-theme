#!/usr/bin/env python3
"""Capture the real desktop material × background matrix with native Accessibility only.

Reads the live DSH window through the existing native-ui / native-inspect helpers
(Accessibility, read-only traversal) and presses *only* Bloom's own menu controls.
Screenshots come from `screencapture -R` over the Bloom menu region, so the images show
the plugin's real rendered menu rather than a mock.

Safety rules this script enforces, not just documents:
  * every press goes through a whitelist of Bloom menu labels and their AX roles;
  * labels that belong to the host (session list, send button, composer) are refused;
  * the user's original palette / scheme / material / ambience is recorded first and
    restored at the end, including after SIGINT / SIGTERM.

Usage:
  scripts/ui/native-material-matrix.py --out /Users/webkubor/.local/state/bloom-preview/r9/matrix
  scripts/ui/native-material-matrix.py --out <dir> --resume      # keep existing evidence
  scripts/ui/native-material-matrix.py --out <dir> --dry-run    # list the plan, press nothing
"""

import argparse
import json
import os
import signal
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

# --------------------------------------------------------------------------------------
# Bloom menu contract (verified against the live v0.26.0 desktop menu via native-ui list).
# --------------------------------------------------------------------------------------

# AX roles observed in the real menu:
#   AXPopUpButton  trigger (top bar) and the host's own popups
#   AXCheckBox     浅色 / 深色 / 跟随系统 and the three material buttons
#   AXRadioButton  one row per scheme for the background presets
MATERIALS = [
    ('frosted', '毛玻璃', 'Frosted glass'),
    ('matte', '磨砂玻璃', 'Matte glass'),
    ('liquid', '液态玻璃', 'Liquid glass'),
]
SCHEMES = [
    ('light', '浅色', 'Light'),
    ('dark', '深色', 'Dark'),
    ('system', '跟随系统', 'System'),
]
# Background presets: the light row shows the glass presets, the dark row the starlight ones.
# Both rows live in the DOM; CSS shows the row matching the host scheme.
BACKGROUNDS = {
    'light': [
        ('stream', '斜光流转', 'Light stream'),
        ('wash', '水彩晕染', 'Watercolor'),
        ('clear', '清透留白', 'Clear'),
        ('off', '不显示', 'Off'),
    ],
    'dark': [
        ('diagonal', '对角漫染', 'Diagonal'),
        ('galaxy', '漫天流星', 'Meteor shower'),
        ('corner', '角落微光', 'Corner'),
        ('off', '不显示', 'Off'),
    ],
}
# The matrix itself: 3 materials × (4 light backgrounds + 4 dark backgrounds).
MATRIX_BACKGROUNDS = {
    'light': ['stream', 'wash', 'clear', 'off'],
    'dark': ['diagonal', 'galaxy', 'corner', 'off'],
}
PALETTES = [
    ('cinnabar', '朱砂'), ('dawn', '粉霞'), ('tangerine', '橙黄'), ('aurora', '落霞'),
    ('osmanthus', '轻黄'), ('mint', '草色'), ('ripple', '天青'), ('mist', '黛蓝'),
    ('lapis', '青金'), ('lavender', '青莲'), ('silverrose', '银红'), ('petal', '桃夭'),
    ('sage', '竹青'), ('stone', '赭石'), ('amber', '琥珀'),
]

# Host-owned labels this script must never touch.
FORBIDDEN_LABELS = {
    '新建会话', '发送', '搜索', '删除', '归档会话', '置顶会话', '重命名', '分享对话',
    'New chat', 'Send', 'Search', 'Delete', 'Archive', 'Pin', 'Rename',
}


class SafetyError(RuntimeError):
    """Raised when the script is about to touch something that is not Bloom's own menu."""


@dataclass
class OriginalState:
    """The user's live choices, captured before the matrix runs."""

    palette: str | None = None
    scheme: str | None = None
    material: str | None = None
    backgrounds: dict[str, str | None] = field(default_factory=dict)
    captured_at: str = ''


@dataclass
class MatrixCell:
    """One (material × background) combination to capture."""

    material: str
    background: str
    scheme: str


# --------------------------------------------------------------------------------------
# Native helpers
# --------------------------------------------------------------------------------------

class Native:
    """Thin wrapper around the compiled native-ui / native-inspect binaries."""

    def __init__(self, helper: Path, inspector: Path) -> None:
        self.helper = helper
        self.inspector = inspector
        for binary in (helper, inspector):
            if not binary.exists():
                raise SystemExit(
                    f'missing native helper: {binary}\n'
                    f'build it first: swiftc scripts/ui/native-ui.swift -o {helper}\n'
                    f'                   swiftc scripts/ui/native-inspect.swift -o {inspector}'
                )

    def _run(self, binary: Path, *args: str) -> str:
        result = subprocess.run([str(binary), *args], capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f'{binary.name} {" ".join(args)} failed: {result.stderr.strip() or result.stdout.strip()}')
        return result.stdout

    def list(self, filter_text: str = '') -> list[dict]:
        raw = self._run(self.helper, 'list', filter_text) if filter_text else self._run(self.helper, 'list')
        return json.loads(raw)

    def press(self, label: str, role: str) -> dict:
        allowed = {('Bloom 主题 ·*', 'AXPopUpButton')}
        allowed |= {(label, 'AXCheckBox') for _, label, _ in MATERIALS + SCHEMES}
        allowed |= {(label, 'AXRadioButton') for items in BACKGROUNDS.values() for _, label, _ in items}
        if (label, role) not in allowed:
            raise SafetyError(f'refusing non-whitelisted control: {label!r} ({role})')
        # native-ui presses the FIRST global match. Refuse duplicate exact labels so
        # a host control cannot accidentally be selected instead of Bloom's control.
        if label != 'Bloom 主题 ·*':
            matches = [r for r in self.list(label) if r.get('role') == role and r.get('label') == label]
            if len(matches) != 1:
                raise SafetyError(f'expected exactly one {role} {label!r}, got {len(matches)}')
        if frontmost_app() != 'DeepSeek Harness':
            activate_dsh()
        raw = self._run(self.helper, 'press', label, role)
        return json.loads(raw)

    def window(self) -> dict:
        return json.loads(self._run(self.helper, 'window'))

    def inspect(self, search: str) -> dict:
        return json.loads(self._run(self.inspector, search))


FRONTMOST_SCRIPT = 'tell application "System Events" to get name of first application process whose frontmost is true'


def frontmost_app() -> str:
    result = subprocess.run(['osascript', '-e', FRONTMOST_SCRIPT], capture_output=True, text=True)
    return result.stdout.strip()


def activate_dsh(timeout: float = 10.0) -> None:
    """Bring DSH to the front and wait until it really is the frontmost app.

    native-ui refuses to press when DSH is not frontmost, and `activate` alone can
    return before the app has actually taken focus, so the wait is mandatory.
    """
    subprocess.run(
        ['osascript', '-e', 'tell application "DeepSeek Harness" to activate'],
        check=True, capture_output=True,
    )
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if frontmost_app() == 'DeepSeek Harness':
            time.sleep(0.4)  # let the AX tree settle after the focus change
            return
        time.sleep(0.3)
    raise RuntimeError('DeepSeek Harness never became the frontmost application')


# --------------------------------------------------------------------------------------
# Menu helpers
# --------------------------------------------------------------------------------------

class BloomMenu:
    """Drives Bloom's own menu through Accessibility and reads back its state."""

    def __init__(self, native: Native) -> None:
        self.native = native

    # -- trigger ------------------------------------------------------------------------
    def trigger(self) -> dict:
        rows = self.native.list('Bloom 主题')
        for row in rows:
            if row.get('role') == 'AXPopUpButton' and str(row.get('help', '')).startswith('Bloom 主题'):
                return row
        raise RuntimeError('Bloom trigger not found in the accessibility tree')

    def is_open(self) -> bool:
        return bool(self.trigger().get('expanded'))

    def open(self) -> None:
        if not self.is_open():
            self.native.press('Bloom 主题 ·*', 'AXPopUpButton')
            self.wait_open(True)

    def close(self) -> None:
        if self.is_open():
            self.native.press('Bloom 主题 ·*', 'AXPopUpButton')
            self.wait_open(False)

    def wait_open(self, expected: bool, timeout: float = 6.0) -> None:
        deadline = time.monotonic() + timeout
        while True:
            if self.is_open() == expected:
                return
            if time.monotonic() > deadline:
                raise RuntimeError(f'Bloom menu did not become {"open" if expected else "closed"}')
            time.sleep(0.15)

    # -- state --------------------------------------------------------------------------
    def rows(self) -> list[dict]:
        return self.native.list()

    def selected_label(self, labels: list[str], role: str | None = None) -> str | None:
        """Return the label among `labels` whose AX value is 1 (checked / selected)."""
        wanted = set(labels)
        for row in self.rows():
            if row.get('label') in wanted and row.get('value') == 1:
                if role is None or row.get('role') == role:
                    return row['label']
        return None

    def scheme_label(self) -> str | None:
        return self.selected_label([label for _, label, _ in SCHEMES])

    def material_label(self) -> str | None:
        return self.selected_label([label for _, label, _ in MATERIALS])

    def background_label(self, scheme: str) -> str | None:
        labels = [label for _, label, _ in BACKGROUNDS[scheme]]
        return self.selected_label(labels, role='AXRadioButton')

    # -- actions ------------------------------------------------------------------------
    def choose(self, label: str, role: str) -> None:
        """Press one Bloom control and wait until it reports itself as chosen."""
        self.open()
        self.native.press(label, role)
        deadline = time.monotonic() + 6.0
        while True:
            if self.selected_label([label], role=role) == label:
                return
            if time.monotonic() > deadline:
                raise RuntimeError(f'control {label!r} never became selected')
            time.sleep(0.15)

    def choose_scheme(self, label: str) -> None:
        self.open()
        if self.scheme_label() == label:
            return
        self.native.press(label, 'AXCheckBox')
        deadline = time.monotonic() + 6.0
        while True:
            if self.scheme_label() == label:
                return
            if time.monotonic() > deadline:
                raise RuntimeError(f'scheme {label!r} never became selected')
            time.sleep(0.15)

    def choose_material(self, label: str) -> None:
        self.open()
        if self.material_label() == label:
            return
        self.native.press(label, 'AXCheckBox')
        deadline = time.monotonic() + 6.0
        while True:
            if self.selected_label([label]) == label:
                return
            if time.monotonic() > deadline:
                raise RuntimeError(f'material {label!r} never became selected')
            time.sleep(0.15)

    def choose_background(self, scheme: str, label: str) -> None:
        self.open()
        if self.background_label(scheme) == label:
            return
        self.native.press(label, 'AXRadioButton')
        deadline = time.monotonic() + 6.0
        while True:
            if self.selected_label([label], role='AXRadioButton') == label:
                return
            if time.monotonic() > deadline:
                raise RuntimeError(f'background {label!r} never became selected')
            time.sleep(0.15)


# --------------------------------------------------------------------------------------
# Capture
# --------------------------------------------------------------------------------------

def menu_region(native: Native) -> tuple[int, int, int, int]:
    """The Bloom menu panel rect in screen points, from the accessibility tree.

    The panel is the AXGroup that holds the menu; native-ui only reports actionable
    elements, so the group is located through the menu's own controls: the panel spans
    from the top of the first Bloom row to the bottom of the last one.
    """
    rows = native.list()
    bloom_rows = [
        row for row in rows
        if row.get('role') in ('AXCheckBox', 'AXRadioButton')
        and row.get('frame', {}).get('w', 0) > 0
        and 250 <= row['frame'].get('x', 0) <= 700
    ]
    if bloom_rows:
        left = min(row['frame']['x'] for row in bloom_rows)
        top = min(row['frame']['y'] for row in bloom_rows)
        right = max(row['frame']['x'] + row['frame']['w'] for row in bloom_rows)
        bottom = max(row['frame']['y'] + row['frame']['h'] for row in bloom_rows)
        return left - 12, top - 44, right - left + 24, bottom - top + 56
    # Fall back to the trigger: capture the trigger plus a generous area below it.
    trigger = next(row for row in rows
                   if row.get('role') == 'AXPopUpButton' and str(row.get('help', '')).startswith('Bloom 主题'))
    frame = trigger['frame']
    return frame['x'], frame['y'] - 8, frame['w'], 900


def capture(native: Native, target: Path) -> dict:
    """Screenshot the Bloom menu region with `screencapture -R` (no window list, no click)."""
    x, y, w, h = menu_region(native)
    rect = f'{x},{y},{w},{h}'
    subprocess.run(
        ['screencapture', '-x', '-o', '-R', rect, str(target)],
        check=True, capture_output=True,
    )
    if not target.exists() or target.stat().st_size == 0:
        raise RuntimeError(f'screencapture produced no image for {target}')
    return {'region': rect, 'x': x, 'y': y, 'w': w, 'h': h}


def palette_state(menu: BloomMenu) -> str | None:
    return menu.trigger().get('label')


# --------------------------------------------------------------------------------------
# Plan
# --------------------------------------------------------------------------------------

def build_plan(materials: list[str], schemes: list[str]) -> list[MatrixCell]:
    """3 materials × (4 light backgrounds + 4 dark backgrounds) = 24 cells."""
    cells: list[MatrixCell] = []
    for material in materials:
        for scheme in schemes:
            if scheme not in MATRIX_BACKGROUNDS:
                continue
            for background in MATRIX_BACKGROUNDS[scheme]:
                cells.append(MatrixCell(material=material, background=background, scheme=scheme))
    return cells


def slug(text: str) -> str:
    keep = [ch if ch.isalnum() else '-' for ch in text]
    return ''.join(keep).strip('-').lower() or 'x'


# --------------------------------------------------------------------------------------
# Offline preflight and mock-only safety checks
# --------------------------------------------------------------------------------------

def validate_snapshot(snapshot: dict) -> dict:
    """Validate a saved BloomDiagnostics summary; this does not prove it is current."""
    if not isinstance(snapshot, dict):
        raise SafetyError('snapshot must be an object')
    page, bloom, inp = (snapshot.get(k) for k in ('page', 'bloom', 'input'))
    if not all(isinstance(v, dict) for v in (page, bloom, inp)):
        raise SafetyError('snapshot is missing page, bloom or input')
    if not isinstance(page.get('id'), str) or not page['id'].strip():
        raise SafetyError('missing page identity')
    if page.get('origin') != 'dsh-app://app' or page.get('visibility') != 'visible' or page.get('focused') is not True:
        raise SafetyError('snapshot was not a focused visible desktop page')
    if inp.get('found') is not True or inp.get('focused') is not False or not isinstance(inp.get('length'), int) or isinstance(inp.get('length'), bool) or inp['length'] < 0:
        raise SafetyError('input state is missing or focused')
    if bloom.get('glass') not in {x[0] for x in MATERIALS}:
        raise SafetyError('explicit restorable material required; auto is unsupported')
    if bloom.get('variant') not in {x[0] for x in PALETTES}:
        raise SafetyError('unknown palette')
    if bloom.get('appearance') not in ('light', 'dark'):
        raise SafetyError('unknown effective appearance')
    if bloom.get('appearancePreference') not in ('light', 'dark', 'system'):
        raise SafetyError('unknown appearance preference')
    if bloom.get('appearanceSource') not in ('host', 'legacy'):
        raise SafetyError('unknown appearance source')
    rotation = bloom.get('rotationMinutes')
    if type(rotation) is not int or rotation not in (0, 5, 15, 30, 60):
        raise SafetyError('unknown rotation interval')
    ambience = bloom.get('ambience')
    if not isinstance(ambience, dict) or any(ambience.get(s) not in {p[0] for p in BACKGROUNDS[s]} for s in ('light', 'dark')):
        raise SafetyError('unknown light or dark background')
    # These fields describe the saved instant, not current window identity or user activity.
    return {'page_id': page['id'], 'variant': bloom['variant'], 'glass': bloom['glass'],
            'appearance': bloom['appearance'], 'appearancePreference': bloom['appearancePreference'],
            'appearanceSource': bloom['appearanceSource'], 'rotationMinutes': rotation,
            'ambience': dict(ambience), 'input_length': inp['length']}


def mock_guarded_restore(original: dict, expected: dict, observe, restore_step) -> None:
    """Model restoration only: stop before any write when observed state diverges.

    A real implementation also needs atomic user-input monitoring, live page/window
    correlation, safe palette restoration and conditional readback after each action.
    This helper is deliberately not wired to native operations.
    """
    for field in ('glass', 'ambience', 'appearancePreference'):
        current = observe()
        if current != expected:
            raise SafetyError('state or user activity changed; restoration stopped')
        if expected[field] != original[field]:
            restore_step(field, original[field])
            expected = dict(expected, **{field: original[field]})
            if observe() != expected:
                raise SafetyError('restoration readback failed; further writes stopped')


def run_self_test() -> int:
    import copy
    import unittest
    from unittest.mock import Mock

    class PreflightTests(unittest.TestCase):
        def setUp(self):
            self.snapshot = {'page': {'id': 'page-1', 'origin': 'dsh-app://app', 'visibility': 'visible', 'focused': True},
                             'bloom': {'variant': 'mist', 'appearance': 'light', 'appearancePreference': 'system',
                                       'appearanceSource': 'host', 'glass': 'liquid', 'rotationMinutes': 15,
                                       'ambience': {'light': 'off', 'dark': 'corner'}},
                             'input': {'found': True, 'focused': False, 'length': 0}}
        def test_valid_saved_snapshot(self):
            self.assertEqual(validate_snapshot(self.snapshot)['rotationMinutes'], 15)
        def test_incomplete_auto_or_unfocused_rejected(self):
            for section, key, value in [('bloom', 'glass', 'auto'), ('bloom', 'variant', None),
                                        ('bloom', 'rotationMinutes', None), ('bloom', 'appearancePreference', None),
                                        ('bloom', 'appearancePreference', 'automatic'), ('bloom', 'appearanceSource', None),
                                        ('bloom', 'appearanceSource', 'unknown'), ('page', 'id', ''),
                                        ('page', 'focused', False), ('input', 'focused', True),
                                        ('bloom', 'ambience', {'light': 'off'})]:
                s = copy.deepcopy(self.snapshot); s[section][key] = value
                with self.subTest(section=section, key=key), self.assertRaises(SafetyError): validate_snapshot(s)
        def test_system_preference_is_separate_from_effective_appearance(self):
            for source in ('host', 'legacy'):
                for effective in ('light', 'dark'):
                    snapshot = copy.deepcopy(self.snapshot)
                    snapshot['bloom'].update(appearance=effective, appearancePreference='system', appearanceSource=source)
                    validated = validate_snapshot(snapshot)
                    self.assertEqual((validated['appearance'], validated['appearancePreference'], validated['appearanceSource']), (effective, 'system', source))
        def test_native_rejects_non_whitelisted_or_ambiguous_controls(self):
            native = object.__new__(Native)
            native.list = Mock(return_value=[{'role': 'AXCheckBox', 'label': '毛玻璃'}] * 2)
            native._run = Mock()
            with self.assertRaises(SafetyError): native.press('发送', 'AXButton')
            with self.assertRaises(SafetyError): native.press('毛玻璃', 'AXCheckBox')
            native._run.assert_not_called()
        def test_restore_readback(self):
            original = {'glass': 'liquid', 'ambience': 'off', 'appearancePreference': 'system', 'appearanceSource': 'host', 'variant': 'mist'}
            current = {'glass': 'matte', 'ambience': 'wash', 'appearancePreference': 'dark', 'appearanceSource': 'host', 'variant': 'mist'}
            def change(field, value): current[field] = value
            action = Mock(side_effect=change)
            mock_guarded_restore(original, dict(current), lambda: dict(current), action)
            self.assertEqual(current, original); self.assertEqual(action.call_count, 3)
        def test_restore_never_overwrites_user_change(self):
            original = {'glass': 'liquid', 'ambience': 'off', 'appearancePreference': 'system', 'appearanceSource': 'host', 'variant': 'mist'}
            expected = dict(original, glass='matte')
            changed = dict(expected, variant='petal')
            action = Mock()
            with self.assertRaises(SafetyError): mock_guarded_restore(original, expected, lambda: changed, action)
            action.assert_not_called()
        def test_failed_readback_stops_further_writes(self):
            original = {'glass': 'liquid', 'ambience': 'off', 'appearancePreference': 'system', 'appearanceSource': 'host', 'variant': 'mist'}
            expected = dict(original, glass='matte', ambience='wash')
            action = Mock()
            with self.assertRaises(SafetyError): mock_guarded_restore(original, expected, lambda: dict(expected), action)
            self.assertEqual(action.call_count, 1)
    return 0 if unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(PreflightTests)).wasSuccessful() else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--helper', type=Path, default=Path.home() / '.local/state/bloom-preview/r7/bin/native-ui')
    parser.add_argument('--inspector', type=Path, default=Path.home() / '.local/state/bloom-preview/r7/bin/native-inspect')
    parser.add_argument('--out', type=Path, default=Path.home() / '.local/state/bloom-preview/r9/matrix')
    parser.add_argument('--materials', nargs='*', default=[key for key, _, _ in MATERIALS],
                        help='material keys to capture (frosted matte liquid)')
    parser.add_argument('--schemes', nargs='*', default=['light', 'dark'],
                        help='schemes whose background rows to capture (light dark)')
    parser.add_argument('--resume', action='store_true', help='keep existing evidence, capture only what is missing')
    parser.add_argument('--dry-run', action='store_true', help='print the plan and exit without pressing anything')
    parser.add_argument('--settle', type=float, default=0.6, help='seconds to wait after each choice')
    parser.add_argument('--preflight-snapshot', type=Path, help='offline BloomDiagnostics summary JSON; never authorizes capture by itself')
    parser.add_argument('--self-test', action='store_true', help='run mock-only offline safety tests')
    args = parser.parse_args()

    if args.self_test:
        return run_self_test()
    if args.preflight_snapshot:
        try:
            summary = validate_snapshot(json.loads(args.preflight_snapshot.read_text(encoding='utf8')))
        except (OSError, ValueError, SafetyError) as exc:
            raise SystemExit(f'preflight rejected: {exc}') from exc
        print(f"offline snapshot accepted for page {summary['page_id']}; live identity and user activity are NOT verified")

    material_labels = {key: label for key, label, _ in MATERIALS}
    unknown = [m for m in args.materials if m not in material_labels]
    if unknown:
        raise SystemExit(f'unknown material(s): {unknown}; choose from {list(material_labels)}')
    unknown_schemes = [s for s in args.schemes if s not in BACKGROUNDS]
    if unknown_schemes:
        raise SystemExit(f'unknown scheme(s): {unknown_schemes}; choose from {list(BACKGROUNDS)}')

    cells = build_plan(args.materials, args.schemes)
    if args.dry_run:
        print(f'{len(cells)} cells -> {args.out}')
        for cell in cells:
            print(f'  {cell.material:8} {cell.scheme:6} {cell.background}')
        return 0

    # AX reports displayed selection, not data-bloom-* attributes nor implicit auto.
    # Without authoritative state and palette restoration, matrix execution cannot
    # meet the restoration contract. Refuse before any UI mutation or evidence write.
    raise SystemExit('BLOCKED: saved snapshot cannot verify current user activity, page/window identity, rotation or safe restoration; no capture performed')
    native = Native(args.helper, args.inspector)
    menu = BloomMenu(native)
    args.out.mkdir(parents=True, exist_ok=True)
    state_path = args.out / 'original.json'
    manifest_path = args.out / 'manifest.json'

    activate_dsh()
    menu.open()

    # ---- record the user's current choices --------------------------------------------
    if args.resume and state_path.exists():
        original = OriginalState(**json.loads(state_path.read_text()))
        records = json.loads(manifest_path.read_text()) if manifest_path.exists() else []
    else:
        original = OriginalState(
            palette=palette_state(menu),
            scheme=menu.scheme_label(),
            material=menu.material_label(),
            backgrounds={},
            captured_at=time.strftime('%Y-%m-%dT%H:%M:%S'),
        )
        for scheme in BACKGROUNDS:
            # Read the row that belongs to this scheme by switching to it, then switching back.
            menu.choose_scheme(dict((k, v) for k, v, _ in SCHEMES)[scheme])
            label = menu.background_label(scheme)
            key = next((key for key, zh, en in BACKGROUNDS[scheme] if label in (zh, en)), None)
            if key is None:
                raise SafetyError(f'cannot identify original {scheme} background: {label!r}')
            original.backgrounds[scheme] = {'key': key, 'label': label}
        if original.scheme:
            menu.choose_scheme(original.scheme)
        state_path.write_text(json.dumps(original.__dict__, ensure_ascii=False, indent=2))
        records = []

    done = {(r['material'], r['scheme'], r['background']) for r in records}
    material_labels_all = {key: label for key, label, _ in MATERIALS}
    scheme_labels = {key: label for key, label, _ in SCHEMES}
    background_labels = {scheme: {key: label for key, label, _ in items} for scheme, items in BACKGROUNDS.items()}

    def restore() -> None:
        """Put the user's own choices back."""
        try:
            menu.open()
            for scheme, background in original.backgrounds.items():
                if not isinstance(background, dict) or not background.get('key') or not background.get('label'):
                    raise SafetyError(f'original {scheme} background lacks key and label: {background!r}')
                menu.choose_scheme(scheme_labels[scheme])
                menu.choose_background(scheme, background['label'])
                actual = menu.background_label(scheme)
                actual_key = next((key for key, zh, en in BACKGROUNDS[scheme] if actual in (zh, en)), None)
                if actual_key != background['key']:
                    raise SafetyError(f'restore verification failed for {scheme}: expected {background}, got {actual!r}')
            if original.scheme:
                menu.choose_scheme(original.scheme)
                if menu.scheme_label() != original.scheme:
                    raise SafetyError('scheme restore verification failed')
            if original.material:
                menu.choose_material(original.material)
                if menu.material_label() != original.material:
                    raise SafetyError('material restore verification failed')
            if palette_state(menu) != original.palette:
                raise SafetyError(f'palette changed: expected {original.palette!r}, got {palette_state(menu)!r}; manual restoration required')
            menu.close()
            print('restored and verified visible menu choices', flush=True)
        except Exception as error:  # restore must never hide the original failure
            print(f'WARNING: could not restore the original choices: {error}', file=sys.stderr, flush=True)

    def on_signal(signum, _frame):
        restore()
        raise SystemExit(128 + signum)

    signal.signal(signal.SIGINT, on_signal)
    signal.signal(signal.SIGTERM, on_signal)

    try:
        for index, cell in enumerate(cells, start=1):
            key = (cell.material, cell.scheme, cell.background)
            if key in done:
                print(f'{index}/{len(cells)} skip (already captured): {cell.material}/{cell.scheme}/{cell.background}', flush=True)
                continue
            scheme_label = scheme_labels[cell.scheme]
            background_label = background_labels[cell.scheme][cell.background]

            menu.choose_scheme(scheme_label)
            menu.choose_background(cell.scheme, background_label)
            menu.choose_material(material_labels_all[cell.material])
            time.sleep(args.settle)

            # Read back the menu state so the record carries evidence, not just intent.
            state = {
                'scheme': menu.scheme_label(),
                'material': menu.material_label(),
                'background': menu.background_label(cell.scheme),
                'palette': palette_state(menu),
            }
            menu.open()  # keep the panel open so the screenshot shows the real menu
            time.sleep(args.settle)

            filename = f'{cell.material}-{cell.scheme}-{slug(background_label)}.png'
            target = args.out / filename
            if target.exists() and args.resume:
                print(f'{index}/{len(cells)} keep existing: {filename}', flush=True)
                continue
            region = capture(native, target)
            records.append({
                'material': cell.material,
                'scheme': cell.scheme,
                'background': cell.background,
                'background_label': background_label,
                'image': str(target),
                'state': state,
                'region': region,
                'captured_at': time.strftime('%Y-%m-%dT%H:%M:%S'),
            })
            manifest_path.write_text(json.dumps(records, ensure_ascii=False, indent=2))
            print(f'{index}/{len(cells)} {filename} {state}', flush=True)
    finally:
        restore()

    print(f'{len(records)} captures in {args.out}', flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
