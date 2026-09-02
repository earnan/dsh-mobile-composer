/** 轻量日志事件总线：任何组件都可调用 log() 记录，浮动面板订阅显示。 */

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: number
  level: LogLevel
  message: string
}

type Listener = (entries: readonly LogEntry[]) => void

const listeners = new Set<Listener>()
let entries: LogEntry[] = []

/** 记录一条日志（最多保留 80 条）。 */
export function log(level: LogLevel, ...args: unknown[]): void {
  const message = args.map(formatArg).join(' ')
  entries = [...entries, { timestamp: Date.now(), level, message }].slice(-80)
  listeners.forEach(fn => fn(entries))
}

/** 订阅日志流；返回取消订阅函数。 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** 读取当前全部日志。 */
export function getEntries(): readonly LogEntry[] {
  return entries
}

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg
  if (arg instanceof File) return 'File(' + arg.name + ', ' + arg.size + ' bytes)'
  if (Array.isArray(arg)) return JSON.stringify(arg)
  if (arg && typeof arg === 'object') return JSON.stringify(arg)
  return String(arg)
}