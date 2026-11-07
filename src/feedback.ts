const ISSUE_URL = 'https://github.com/webkubor/dsh-bloom-theme/issues/new'

/** Build a reviewable issue draft; opening it never submits the feedback. */
export function buildFeedbackUrl(diagnostics: string, language: string): string {
  const zh = language === 'zh'
  const body = zh
    ? `### 问题或建议\n\n请在这里描述。\n\n### 截图或录屏\n\n如愿意分享，请将文件拖入此处。\n\n### 基础诊断\n\n${diagnostics}`
    : `### Issue or suggestion\n\nDescribe it here.\n\n### Screenshot or recording\n\nDrag a file here if you wish to share one.\n\n### Basic diagnostics\n\n${diagnostics}`
  const url = new URL(ISSUE_URL)
  url.searchParams.set('body', body)
  return url.toString()
}
