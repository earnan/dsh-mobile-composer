/**
 * 「调试日志」设置行，注入 settings.general.item 槽位（设置界 General 分区）。
 * 原生 checkbox 实现开关，写入移动端 mobile-composer 命名空间的 debugLog 字段。
 */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { NS } from './locales.ts'

/** 由 apply 注入：当前值 + 写回。 */
export interface DebugLogInjected {
  debugLog: boolean
  /** 切换调试日志开关（true=启用，写持久化设置）。 */
  onToggle: (value: boolean) => void
}

export type DebugLogSettingProps =
  PropsRuntime<'settings.general.item'>
  & PropsLocale<typeof NS>
  & DebugLogInjected

/**
 * 渲染调试日志开关行。
 * @param props - 组合槽位 props。
 */
export function DebugLogSetting({ debugLog, onToggle, t }: DebugLogSettingProps) {
  return (
    <label
      data-mobile-composer="debuglog-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        width: '100%',
        padding: '10px 0',
        cursor: 'pointer',
      }}
    >
      <span style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--dsw-alias-label-primary, #111)',
          }}
        >
          {t('debugLog')}
        </span>
        <span
          style={{
            display: 'block',
            marginTop: '2px',
            fontSize: '12px',
            lineHeight: '1.4',
            color: 'var(--dsw-alias-label-secondary, #666)',
          }}
        >
          {t('debugLogDesc')}
        </span>
      </span>
      <input
        type="checkbox"
        checked={debugLog}
        onChange={(e) => onToggle(e.target.checked)}
        style={{ flex: 'none', width: '20px', height: '20px' }}
      />
    </label>
  )
}
