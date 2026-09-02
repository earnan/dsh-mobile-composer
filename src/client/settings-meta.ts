/** 设置命名空间常量与类型（不含 schemastery，供 client 安全引用）。 */

export const MOBILE_COMPOSER_SETTINGS_NAMESPACE = 'mobile-composer'

/** 「调试日志」开关字段名。 */
export const DEBUG_LOG_FIELD = 'debugLog'

export interface MobileComposerSettings {
  /** 是否启用浮动调试日志面板；缺省 false。 */
  debugLog?: boolean
}
