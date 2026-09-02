# DSH 客户端插件设置项 API 调研

> 为给 `dsh-mobile-composer` 添加「调试日志」设置开关而调研。DSH 客户端插件注册持久化设置项的完整链路。

## 一、核心结论

DSH 的设置是**命名空间（namespace）**制：**Host 侧插件注册 schema**，客户端插件用 `settingsScope` **绑定读/写**，并注入 `settings.general.item` slot 渲染设置行。客户端**不能**注册 namespace（`SettingsScopeSpec` 注释明确 namespace 由 owning Host plugin 注册）。

## 二、链路（三段）

### 1. Host 侧：注册 namespace schema

在插件 host 入口 `src/index.ts`（dsh-mobile-composer 目前是空 apply）里：
```ts
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import { NS, Schema } from './mobile-composer-settings.ts'

export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(NS, Schema)
  })
}
```
- `settings.register(ns, schema, options?)` 来自 `@deepseek-ai/dsh-settings` 的 `SettingsProvider`（`ctx.settings`）。
- schema 用 `@deepseek-ai/schemastery` 定义，如 `z.object({ debugLog: z.boolean().required(false) })`。
- 官方参考：`packages/client/locale/src/index.ts` 的 `apply` 正是这个结构。

### 2. 客户端：绑定 namespace 读值

在客户端 `src/client/index.ts`：
```ts
// inject 数组需含 settingsScope（有的还要 remote）
export const inject = ['slots', 'locale', 'conversation', 'sessions', 'settingsScope'] as const

const host = ctx.settingsScope.bind<MobileComposerSettings>({ namespace: NS })
// host.getSnapshot() → { status: 'loading'|'ready'|'unavailable', value, revision, writable ... }
// host.subscribe(fn) → 监听快照变化；host.mutate(ops, rev?) → 原子写
```
- `settingsScope` 由 `@deepseek-ai/dsh-client-ui-settings` 提供（`ctx.settingsScope`），是 client 侧的设置作用域服务。
- `SettingsScope<T>` 接口：`getSnapshot()`（返回 `SettingsScopeSnapshot`）、`subscribe(listener)`、`mutate(ops, expectedRevision?)`、`write(field, value)`、`reset(rev?)`。
- `SettingsScopeSpec<T>`：`{ namespace: string; decode?: (section) => T | undefined }`——namespace 必须与 host 注册一致。

### 3. 客户端：渲染设置行

把开关行注入设置界面的 General 分区：
```ts
ctx.slots.inject('settings.general.item', () => ctx.slots.register({
  name: 'settings.general.item',
  id: 'mobile-composer-debuglog',
  order: 0,
  locale: NS,
  inject: () => ({ ... 传给组件的方法 }),
}, DebugLogSettingRow))
```
- `settings.general.item` 是**设置界 General 分区的 item 列表 slot**（list 型）。
- 组件 Props = `PropsRuntime<'settings.general.item'> & PropsLocale<NS> & 注入面`。
- 官方参考：`packages/client/locale/src/client/index.ts` 的 `LanguageRow`。

## 三、关键类型

| 类型 | 来源 | 作用 |
|------|------|------|
| `ctx.settings`（`SettingsProvider`） | `@deepseek-ai/dsh-settings` | Host 注册命名空间 `register(ns, schema, opts?)` |
| `ctx.settingsScope` | `@deepseek-ai/dsh-client-ui-settings` | Client 绑定 `bind(spec)` → `SettingsScope<T>` |
| `SettingsScope<T>` | 同上 | `getSnapshot()/subscribe(cb)/mutate(ops,rev?)/write(field,v)/reset(rev?)` |
| `SettingsScopeSnapshot<T>` | 同上 | `{ status, value, base, user, revision, writable, mode }` |
| `@deepseek-ai/schemastery` | 独立 | 定义 schema（`z.object(...)`） |

## 四、本插件改动清单（方案 A）

1. `src/mobile-composer-settings.ts`（新增）：namespace + schema（`debugLog?: boolean`）。
2. `src/index.ts`（host）：`apply` 用 `ctx.inject(['settings'], ...)` 注册 namespace。
3. `src/client/index.ts`：`inject` 加 `settingsScope`；`settingsScope.bind` 读 `debugLog`，据此决定是否安装 log-panel；注入 `settings.general.item` 渲染开关行。
4. `src/client/DebugLogSetting.tsx`（新增）：开关行组件，`write('debugLog', v)`。
5. `src/client/log-panel.ts`：保留 `?debug=1` 强制唤醒，新增受 settings `debugLog` 控制（settings 优先，无 settings 时退化为 URL 参数）。
6. `package.json`：peerDependencies 加 `@deepseek-ai/dsh-settings`、`@deepseek-ai/dsh-client-ui-settings`（引入 `@deepseek-ai/dsh-api-remotes`）。

## 五、动态启停 log-panel 的难点

settings 经 remote 异步到达，client apply 时 `getSnapshot().value` 初始为 `undefined`/`loading`。不能同步判断，需：
- `subscribe(() => { const v = host.getSnapshot().value?.debugLog; 动态安装/移除 log-panel })`。
- 用 `ctx.effect` 的返回清理函数做卸载，订阅触发时重新求值。
- 兜底：settings `status === 'unavailable'` 时退化为 URL `?debug=1` 判断。

## 来源

- `packages/settings/settings/lib/types/index.d.ts`（SettingsProvider/register/descriptor）
- `packages/client/ui-settings/src/client/settings-contract.ts`（SettingsScope/Snapshot/Spec）
- `packages/client/locale/src/index.ts` + `src/client/index.ts` + `src/client/LanguageRow.tsx`（官方完整用例）