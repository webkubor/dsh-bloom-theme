# Security Policy / 安全策略

## 报告漏洞 / Reporting a Vulnerability

发现安全问题请**不要开公开 issue**，使用 GitHub 私有漏洞报告（Security → Report a vulnerability），
或联系仓库 owner。收到后会在 7 天内响应。

## 范围说明 / Scope

本仓库是一个 **DSH 主题插件**：产物只有 CSS 与少量展示逻辑，零运行时依赖，
不接触用户凭据、不上传数据、不发起网络请求（版本号检查是向 npm registry 的只读 GET）。

以下情况不属于安全漏洞：

- 主题配色 / 视觉表现问题（请开普通 issue）
- DSH 宿主应用本身的问题（请到 DeepSeek Harness 仓库反馈）
