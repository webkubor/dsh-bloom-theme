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

echo "✓ pre-commit checks passed"
