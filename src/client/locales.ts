/** dsh-mobile-composer 文案命名空间与词典。 */

export const NS = 'mobileComposer'

/** 简体中文词典（key 集合的唯一事实源）。 */
export const zh = {
  upload: '上传图片',
  steer: '插话发送',
} as const

/** 英文词典，key 与中文一致。 */
export const en: Record<MobileRemoteKey, string> = {
  upload: 'Upload image',
  steer: 'Steer send',
}

/** `mobileComposer` 命名空间的 key 域（zh 为事实源）。 */
export type MobileRemoteKey = keyof typeof zh
