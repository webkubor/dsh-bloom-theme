#!/bin/bash
# 仓库级 pre-commit 门禁（由全局 ~/.config/git/hooks/pre-commit 调用）。
# 约定见该 hook 头注释：commit 时只快检，重活挪 CI。
# 本仓库的快检 = 打包契约 + WCAG 对比度护栏（npm run check）。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# client.js 是全部逻辑所在，语法先拦一道
node --check lib/client.js
node --check lib/index.js

# 打包契约 + contrast-guard
npm run check

# DSH 宿主契约门禁（2026-10-30 加）：只在本次提交动了产物时跑，用真 cordis 内核试跑 apply。
# 单测绿 ≠ 宿主能起：那天单测 29/29 全绿，桌面端照样起不来。
if git diff --cached --name-only | grep -qE '^(lib/|package\.json$)'; then
  node ../scripts/dsh-dev.mjs check
fi

echo "✓ pre-commit checks passed"
