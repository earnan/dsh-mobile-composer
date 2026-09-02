/** dsh-mobile-composer 设置命名空间与 schema。 */

import z from '@deepseek-ai/schemastery'

/** 设置命名空间（host 注册、client 绑定共用）。 */
export const MOBILE_COMPOSER_SETTINGS_NAMESPACE = 'mobile-composer'

/** 「调试日志」开关字段名。 */
export const DEBUG_LOG_FIELD = 'debugLog'

/** 设置域类型。 */
export interface MobileComposerSettings {
  /** 是否启用浮动调试日志面板；缺省 false。 */
  debugLog?: boolean
}

/** 设置 schema；也是 client 校验用的 wire 形状。 */
export const MobileComposerSettingsSchema: z<MobileComposerSettings> = z.object({
  [DEBUG_LOG_FIELD]: z.boolean().required(false),
})
