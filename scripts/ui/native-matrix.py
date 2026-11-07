"""Capture real desktop combinations using native Accessibility menu actions."""
import argparse
import json
from pathlib import Path
import subprocess
import time
import signal

PALETTES = [
    ('cinnabar', '朱砂', '日出江花红胜火'), ('dawn', '粉霞', '晓看红湿处'),
    ('tangerine', '橙黄', '最是橙黄橘绿时'), ('aurora', '落霞', '落霞与孤鹜齐飞'),
    ('osmanthus', '轻黄', '暗淡轻黄体性柔'), ('mint', '草色', '草色遥看近却无'),
    ('ripple', '天青', '雨过天青云破处'), ('mist', '黛蓝', '山色有无中'),
    ('lapis', '青金', '碧海青天夜夜心'), ('lavender', '青莲', '清水出芙蓉'),
    ('silverrose', '银红', '银烛秋光冷画屏'), ('petal', '桃夭', '灼灼其华'),
]
AMBIENCE = {'浅色': ['斜光流转', '水彩晕染', '清透留白', '不显示'],
            '深色': ['对角漫染', '漫天流星', '角落微光', '不显示']}
MATERIALS = ['毛玻璃', '磨砂玻璃', '液态玻璃']
parser = argparse.ArgumentParser()
parser.add_argument('--helper', default='/tmp/bloom-native-ui')
parser.add_argument('--out', type=Path, required=True)
parser.add_argument('--mode', choices=['representatives', 'palettes', 'full'], default='representatives')
parser.add_argument('--resume', action='store_true')
args = parser.parse_args()
args.out.mkdir(parents=True, exist_ok=True)


def ui(*parts):
    result = subprocess.run([args.helper, *parts], capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def trigger():
    return next(row for row in ui('list', 'Bloom 主题') if row['role'] == 'AXPopUpButton' and row.get('help', '').startswith('Bloom 主题'))


def wait_for(read, expected, message):
    deadline = time.monotonic() + 5
    while True:
        current = read()
        if current == expected:
            return
        if time.monotonic() >= deadline:
            raise RuntimeError(f'{message}: expected {expected}, got {current}')
        time.sleep(.15)


def menu(opened):
    if trigger().get('expanded', False) != opened:
        ui('press', 'Bloom 主题 ·*', 'AXPopUpButton')
    wait_for(lambda: trigger().get('expanded', False), opened, 'Native menu visibility')


def selected(rows, labels):
    return next((row['label'] for row in rows if row.get('value') == 1 and row['label'] in labels), None)


def choose(label, role):
    menu(True)
    ui('press', label, role)
    if role in ('AXCheckBox', 'AXRadioButton'):
        wait_for(lambda: next((row.get('value') for row in ui('list', label)
                               if row['role'] == role and row['label'] == label), None),
                 1, f'Native control {label}')


def palette(item):
    _, title, poem = item
    menu(True)
    ui('press', f'{title} · {poem}', 'AXStaticText')
    if trigger()['label'] != title:
        raise RuntimeError(f'Palette did not change to {title}')


subprocess.run(['osascript', '-e', 'tell application "DeepSeek Harness" to activate'], check=True, capture_output=True)
menu(True)
original_rows = ui('list')
original = {'palette': trigger()['label'], 'scheme': selected(original_rows, ['浅色', '深色', '跟随系统']),
            'material': selected(original_rows, MATERIALS), 'ambience': selected(original_rows, sum(AMBIENCE.values(), []))}
if args.resume:
    original = json.loads((args.out / 'original.json').read_text())
    records = json.loads((args.out / 'manifest.json').read_text())
else:
    original['ambiences'] = {}
    try:
        for scheme, choices in AMBIENCE.items():
            choose(scheme, 'AXCheckBox')
            original['ambiences'][scheme] = selected(ui('list'), choices)
    finally:
        choose(original['scheme'], 'AXCheckBox')
    (args.out / 'original.json').write_text(json.dumps(original, ensure_ascii=False, indent=2))
    records = []

def interrupt(signum, frame):
    raise SystemExit(128 + signum)

signal.signal(signal.SIGTERM, interrupt)
completed = {(r['palette'], r['scheme'], r['ambience'], r['material']) for r in records}
items = [p for p in PALETTES if p[0] in ['mist', 'tangerine', 'petal']] if args.mode == 'representatives' else PALETTES
try:
    for item in items:
        palette(item)
        for scheme in ['浅色', '深色']:
            choose(scheme, 'AXCheckBox')
            ambs = AMBIENCE[scheme] if args.mode == 'full' else [AMBIENCE[scheme][0 if scheme == '浅色' else 2]]
            for amb in ambs:
                choose(amb, 'AXRadioButton')
                for material in MATERIALS if args.mode == 'full' else ['液态玻璃']:
                    if (item[0], scheme, amb, material) in completed:
                        continue
                    choose(material, 'AXCheckBox')
                    state = ui('list')
                    assert selected(state, ['浅色', '深色']) == scheme
                    assert selected(state, MATERIALS) == material
                    assert selected(state, AMBIENCE[scheme]) == amb
                    menu(False)
                    window = ui('window')
                    if not window['onscreen']:
                        raise RuntimeError('Native window moved offscreen; capture stopped')
                    filename = f'{item[0]}-{scheme}-{amb}-{material}.png'
                    target = args.out / filename
                    subprocess.run(['screencapture', '-x', '-o', '-l', str(window['id']), str(target)], check=True)
                    records.append({'palette': item[0], 'scheme': scheme, 'ambience': amb, 'material': material,
                                    'image': str(target), 'window': window, 'nativeControlsVerified': True})
                    (args.out / 'manifest.json').write_text(json.dumps(records, ensure_ascii=False, indent=2))
                    print(f'{len(records)}: {filename}', flush=True)
finally:
    menu(True)
    for scheme, ambience in original.get('ambiences', {}).items():
        if ambience:
            choose(scheme, 'AXCheckBox')
            choose(ambience, 'AXRadioButton')
    choose(original['scheme'], 'AXCheckBox')
    if original['ambience']:
        choose(original['ambience'], 'AXRadioButton')
    if original['material']:
        choose(original['material'], 'AXCheckBox')
    palette(next(item for item in PALETTES if item[1] == original['palette']))
    menu(False)
    print('Restored original visible menu choices; implicit auto-vs-explicit material persistence is not observable via AX.', flush=True)
