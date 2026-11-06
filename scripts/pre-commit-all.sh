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

# 本仓的 React Slot 生命周期回归可在独立 worktree 复现；不依赖父目录私有脚本。
# 这是本地回归，不代替官方管理器激活与桌面实机验收。
if git diff --cached --name-only | grep -qE '^(src/|lib/|package\.json$|test/)'; then
  node --test test/lifecycle.test.mjs
fi

echo "✓ pre-commit checks passed"
