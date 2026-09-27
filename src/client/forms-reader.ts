/**
 * rc.2 设置绑定：基于共享 configForms 服务的字段读取器（带写入）。
 *
 * ## 背景（0.1.7-rc.2 设置模型重构）
 *
 * 旧的 `settingsScope` 服务在 rc.2 被整体删除，设置域改为
 * 「Host 按每个 profile entry 的 Config schema 派生 form + 共享 describe mirror」。
 * 客户端经 `ctx.configForms`（由 `dsh-client-ui-settings` 提供）访问：
 * `describe()` 列出全部 namespace，`get(ns)` 拿单个 form（getSnapshot/subscribe/set）。
 *
 * 共享面不携带包身份，本插件按「自己的 Config schema 声明的字段」识别自己的
 * entry（与 dsh-ssh 0.4.3 的 SharedFormsReader 同一判据）。entry 列表随 mirror
 * 异步到达，未拿到 form 前报告 loading，不视为不存在。
 *
 * 实现参照 dsh-ssh 0.4.3 `src/client/settings-binding.ts`（rc.2 上已验证），
 * 在其基础上补了 `set()`（dsh-ssh 只读）。
 */

/** configForms 服务最小面（本地类型，避免依赖具体包的 type-only 导出）。 */
export interface ConfigFormsFace {
  describe(): {
    getSnapshot(): {
      view?: { namespaces?: Array<{ ns: string; value: unknown }> } | null
    }
    subscribe(listener: () => void): () => void
  }
  get(ns: string): ConfigFormFace | undefined
}

/** 单个配置 form 最小面。 */
export interface ConfigFormFace {
  getSnapshot(): {
    status: string
    value?: Record<string, unknown>
    writable?: boolean
    [key: string]: unknown
  }
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<boolean>
}

/** 读取器快照形状（与 ConfigFormSnapshot 兼容的最小面）。 */
export interface ReaderSnapshot {
  status: string
  value?: Record<string, unknown>
  writable?: boolean
  [key: string]: unknown
}

/** 未拿到 form 前的快照：loading 态。 */
const PENDING_SNAPSHOT: ReaderSnapshot = {
  status: 'loading',
  value: undefined,
  writable: false,
}

/** 某个 namespace section 是否携带目标字段。 */
function carriesField(section: unknown, field: string): boolean {
  return (
    typeof section === 'object' &&
    section !== null &&
    Object.hasOwn(section as Record<string, unknown>, field)
  )
}

/**
 * 按「字段归属」绑定共享面的读取器。
 * - `getSnapshot().value` 即 form 的值对象（与旧 settingsScope bind 的快照形状一致）；
 * - `set(field, value)` 委托给绑定的 form（Host 接受才返回 true）；
 * - mirror 每次变化都重解析，直到绑到自己的 entry。
 */
export class SharedFormsReader {
  private readonly forms: ConfigFormsFace
  private readonly field: string
  private readonly listeners = new Set<() => void>()
  private unsubscribeMirror: () => void
  private unsubscribeForm: (() => void) | undefined
  private form: ConfigFormFace | undefined
  private snapshot = PENDING_SNAPSHOT

  constructor(forms: ConfigFormsFace, field: string) {
    this.forms = forms
    this.field = field
    this.unsubscribeMirror = forms.describe().subscribe(() => {
      this.bind()
      this.publish()
    })
    this.bind()
  }

  getSnapshot(): ReaderSnapshot {
    return this.snapshot
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /**
   * 写一个字段（转发给绑定的 form）。
   * @returns Host 是否接受；未绑到 form 时返回 false（不排队）。
   */
  async set(field: string, value: unknown): Promise<boolean> {
    if (this.form === undefined) return false
    return this.form.set(field, value)
  }

  /** 释放 mirror/form 订阅并清空监听者。 */
  dispose(): void {
    this.unsubscribeMirror()
    this.unsubscribeForm?.()
    this.unsubscribeForm = undefined
    this.listeners.clear()
  }

  /** mirror 点名本插件 entry 后绑定其 form。 */
  private bind(): void {
    if (this.form !== undefined) return
    const namespaces = this.forms.describe().getSnapshot().view?.namespaces
    const entry = namespaces?.find((candidate) => carriesField(candidate.value, this.field))
    if (entry === undefined) return
    const form = this.forms.get(entry.ns)
    if (form === undefined) return
    this.form = form
    this.snapshot = form.getSnapshot()
    this.unsubscribeForm = form.subscribe(() => {
      this.snapshot = form.getSnapshot()
      this.publish()
    })
    this.publish()
  }

  private publish(): void {
    for (const listener of this.listeners) listener()
  }
}
