#!/usr/bin/env python3
"""展示图采集脚本（开发用，不随 npm 包分发）。

用 headless Chromium 打开本地 DSH Web（127.0.0.1:3080），通过 localStorage
驱动 Bloom 插件状态，截取 README 用的展示图：
  1. frames/off|on.png        氛围层开/关对比（mist 暗色）
  2. switcher-panel.png       顶栏下拉 + 氛围设置区展开
  3. frames/variant-*.png     4 变体 × 明暗联动壁纸帧（后续合成 GIF / 拼图）

用法：python3 scripts/capture_showcase.py [输出目录=assets/showcase]
"""
import json
import os
import sys
import time

from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/showcase'
URL = 'http://127.0.0.1:3080'
os.makedirs(os.path.join(OUT, 'frames'), exist_ok=True)


def amb(**over):
    base = {'enabled': True, 'mode': 'auto', 'dim': 30, 'glass': True, 'blur': 16}
    base.update(over)
    return json.dumps(base)


def set_bloom(page, variant, ambience):
    page.evaluate('[v,a] => { localStorage.setItem("dsh-bloom-variant", v);'
                  ' if (a === null) localStorage.removeItem("dsh-bloom-ambience");'
                  ' else localStorage.setItem("dsh-bloom-ambience", a); }',
                  [variant, ambience])
    page.reload(wait_until='networkidle')
    page.wait_for_timeout(3500)  # 壁纸从图床加载需要一点时间


with sync_playwright() as p:
    # 本机 playwright(python) 与缓存里的浏览器版本不匹配，直接指到已有可执行文件
    exe = None
    import glob
    for pat in ('~/Library/Caches/ms-playwright/chromium*/chrome-mac*/Chromium',
                '~/Library/Caches/ms-playwright/chromium*/chrome-*/Chromium',
                '~/Library/Caches/ms-playwright/chromium_headless_shell*/chrome-headless-shell-*/chrome-headless-shell'):
        hits = glob.glob(os.path.expanduser(pat))
        if hits:
            exe = hits[0]
            break
    browser = p.chromium.launch(executable_path=exe)
    page = browser.new_page(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    page.goto(URL, wait_until='networkidle', timeout=60000)
    page.wait_for_timeout(4000)

    # 1. 氛围层开/关对比
    set_bloom(page, 'mist', None)
    page.screenshot(path=os.path.join(OUT, 'frames', 'off.png'))
    set_bloom(page, 'mist', amb())
    page.screenshot(path=os.path.join(OUT, 'frames', 'on.png'))

    # 2. 设置面板展开
    page.click('.dsh-bloom-trigger')
    page.wait_for_timeout(600)
    page.screenshot(path=os.path.join(OUT, 'switcher-panel.png'))
    page.keyboard.press('Escape')

    # 3. 4 变体 × 明暗
    for scheme in ('dark', 'light'):
        page.emulate_media(color_scheme=scheme)
        for v in ('mist', 'cinnabar', 'petal', 'ripple'):
            set_bloom(page, v, amb())
            page.screenshot(path=os.path.join(OUT, 'frames', f'variant-{v}-{scheme}.png'))
            print(f'captured {v}-{scheme}')

    browser.close()

print('done ->', OUT)
