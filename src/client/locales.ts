/** dsh-mobile-composer 文案命名空间与词典。 */

export const NS = 'mobileComposer'

/** 简体中文词典（key 集合的唯一事实源）。 */
export const zh = {
  upload: '上传图片',
  steer: '插话发送',
  debugLog: '调试日志',
  debugLogDesc: '在右下角显示浮动调试日志面板（排查上传/API 问题用）',
} as const

/** 英文词典，key 与中文一致。 */
export const en: Record<MobileRemoteKey, string> = {
  upload: 'Upload image',
  steer: 'Steer send',
  debugLog: 'Debug log',
  debugLogDesc: 'Show a floating debug log panel (for troubleshooting uploads/API)',
}

/** `mobileComposer` 命名空间的 key 域（zh 为事实源）。 */
export type MobileRemoteKey = keyof typeof zh