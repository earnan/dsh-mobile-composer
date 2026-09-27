# dsh-mobile-composer

DSH（DeepSeek Harness）移动端 UI 增强插件：让手机通过公网/局域网访问 DSH Web UI 时，获得接近桌面端的完整体验。

纯 Cordis 客户端插件，**不改官方源码**，通过官方槽位（slot）+ 服务面 + DOM 注入实现。

## 功能

| 功能 | 生效范围 | 实现方式 |
|------|---------|---------|
| **上传图片按钮** | ≤1023px | `conversation.input.left` 槽位按钮（图片图标）。自带 `accept` 白名单的 picker，选中后用 `DataTransfer` 回填给官方隐藏 `<input type=file>`，**复用官方 intake 管线** |
| **回形针附件按钮** | 全宽度 | 0.1.6 官方删掉了工具栏里的回形针（改到「+」菜单），本插件按**幂等判据**补一个，点击转发到同一个官方 input；0.1.5 官方按钮在位时自动撤除，不重复 |
| **插话发送按钮** | ≤1023px | `conversation.input.right` 槽位按钮，`conversation.input.for(actx).submit('steer')`；仅在运行中显示 |
| **回车=换行** | ≤1023px | 捕获阶段拦截裸 Enter，**翻译成 `Shift+Enter`** 交给 Lexical 官方换行分支（手机没有 Shift 键） |
| **发送语义三分** | ≤1023px | Enter=换行 / 官方主按钮=**排队发送**（窄屏把 `ui-conversation.busyEnter` 规范为 `queue`，离开窄屏还原用户值）/ 插话按钮=插话 |
| **退出按钮拖动** | ≤1023px | DOM 注入 pointer 拖拽 + localStorage 位置记忆 |
| **隐藏牛马看板徽标** | ≤1023px | CSS 隐藏 `dsh-worktime-board` 的 `.wtb-badge`（它 `position:fixed; bottom/right:16px; z-index:2147483000`，压在发送/插话按钮上） |
| 浮动调试日志 | 全端（默认关） | DOM 注入悬浮面板（log-bus + log-panel），**设置开关控制**（设置·General），`?debug=1` 兜底 |

上表除注明「全宽度 / 全端」者外均是**移动端专属**（≤1023px，由 `matchMedia` 与 CSS 媒体查询双重判定），桌面端行为不变。

> ⚠️ 桌面全宽窗口下看不到上传/插话按钮、Enter 也仍是发送 —— 测移动端行为请把窗口拖窄到 <1024px 或用设备模拟。


## 架构依据

DSH 官方暴露了三层可扩展面，本插件全部使用公开 API：

1. **槽位系统**：`ctx.slots.inject(slotName, factory)`，输入区有 `conversation.input.left`（工具行左）、`conversation.input.right`（发送按钮左）等 list 槽位。
2. **conversation 服务**：`ctx.conversation`（`IConversation`）公开 `input`（`SessionInputResolver`），其 `for(actx).submit('steer')` 即插话发送；`createDrafts(sessionId, files)` 把 File 转成草稿附件。
3. **官方隐藏 file input**：composer 工具行里始终有一个 `<input type="file">`（0.1.5/0.1.6 都在），其 `onPickFiles → intakeFiles → addFiles` 是**附件入库的唯一权威管线**。本插件把选中的文件交给它，而不是自己重做一遍。

### 两个必须记住的契约（都栽过）

**① session 槽位的 `inject` 工厂收到的是 `SessionId` 字符串，不是 Context。**

```ts
// ui-slots 的 InjectParams
ScopeOf<K> extends 'session' ? [sessionId: SessionIdOf] : ...
```

把它当 Context 传给 `sessions.scopeOf(actx)` / `conversation.input.for(actx)` 会**静默失效**
（不抛错、无日志），症状是「按钮点了没反应」。需要 Context 时用 `sessions.scope(sessionId)` 换。

**② `InputActions` 里没有 `addFiles`。**

`addFiles` 只存在于 `ComposerBarInjected`（仅 `conversation.composer.bar` 槽位拿得到）。
历史遗留代码里的 `inputActions.addFiles(...)` 从未生效过。`InputActions` 实际成员：
`setDraft` / `addAttachments` / `removeAttachment` / `pruneAttachments` / `submit`。

### 为什么复用官方 input 而不是自己调服务面

官方 `intakeFiles` 内含图片限额校验、类型拒绝分支、上传队列与 toast 提示。
自建一份必然逐渐漂移；而「把文件交给官方 input」只依赖一个被两个大版本反复证实的事实。

### 焦点契约

官方给 composer 里**每一个**工具按钮都挂了 `keepFocus`（mousedown `preventDefault` +
重聚焦编辑器），注释原文是「Button presses steal focus from the editor」。
插件注入的按钮必须照做 —— 否则移动端输入法会在 contenteditable 失焦时
**丢弃尚未提交的组合文本**，表现为「打好的问题不见了、只剩图片」。

回车换行与退出拖动参考了 `@dsh-external/dsh-mobile-nav` 的 DOM 级覆盖范式（捕获阶段事件拦截 + MutationObserver）。

## 安装

将本包装入 DSH 的 web profile，并加入 `cordis.yml` 的 bundles：

```bash
# 假设 DSH 第三方插件装在 ~/.dsh/profiles/web/node_modules/
cd ~/.dsh/profiles/web
npm install <本包路径>
```

`cordis.patch.yml` 由 `dsh.bundle.patch` 声明，DSH 加载器会自动插入插件行；若你的 profile 未走 patch 机制，手动在 `cordis.yml` 的 bundles 加一行：

```yaml
bundles:
  - '@dsh-external/dsh-mobile-composer'
```

### 从 GitHub 安装

仓库已包含构建产物 `lib/client.js`，可直接从 GitHub 安装，无需本地 build：

```bash
# 进入 DSH 的 web profile
cd ~/.dsh/profiles/web
npm install github:earnan/dsh-mobile-composer
# 若 peerDependencies 版本校验报错，加 --legacy-peer-deps
```

安装后在 profile 的 `package.json` 注册（与上方 bundles 二选一依赖注入）：
- `dependencies` 增加 `"@dsh-external/dsh-mobile-composer": "github:earnan/dsh-mobile-composer"`
- `dsh.profile.bundles` 增加 `"@dsh-external/dsh-mobile-composer"`

重启 web 进程，boot manifest 的 `rev` 自动刷新即可生效。

## 构建

```bash
npm install
npm run build      # esbuild 打包 src/client → lib/client.js
```

## 配套（本插件不包含，需另行配置）

「人在外面用手机继续用 DSH」还需要以下三项，它们不属于本插件：

1. **设置/凭据远程放开**：connection 包的 `PRIVILEGED_METHODS` 硬编码了 settings/credentials 的 loopback 锁定，无插件扩展点。需对官方源码打 patch（删除 settings.describe/update/replace/mutate、credentials.*、llm.discoverModels 条目），或等上游提供 `allowRemoteSettings` 配置开关。
2. **视觉模型**：`~/.dsh/settings.yaml` 的 `llm-deepseek.models` 补 `deepseek-v4-flash-vision-exp`。
3. **外网访问**：SSH 隧道 + LAN 代理 + `trustedHosts` 配置（独立项目 `dsh-remote-access`）。

> ⚠️ 设置/凭据放开会削弱安全边界：能访问端口的同网段调用者可读写设置、读取 API Key。仅适合单用户、免认证、局域网信任设备场景，请自担风险。

## 目录结构

```
src/
├── index.ts             # 主机侧空 apply（纯客户端插件）
└── client/
    ├── index.tsx        # apply + slot 注入 + 移动端发送语义 + 样式
    ├── locales.ts       # 文案
    ├── UploadButton.tsx # 上传图片按钮（交文件给官方 input）
    ├── attach-button.ts # 回形针注入（补 0.1.6 删掉的官方附件入口）
    ├── SteerButton.tsx  # 插话发送按钮
    ├── enter-newline.ts # 回车换行（Enter → Shift+Enter 翻译）
    ├── float-drag.ts    # 退出按钮拖动
    ├── log-bus.ts       # 日志事件总线
    └── log-panel.ts     # 浮动日志面板
```

## ⚠️ 升级兼容性注意

DSH（harness）是 monorepo，`@deepseek-ai/*` 包由本地源码构建，**每次升级 API 可能变化**。
本插件最怕的不是编译报错，而是**静默漂移**——功能坏掉后没人再点那个按钮，Bug 就长期潜伏
（本插件的上传按钮就这样失效过多个版本）。

升级 DSH 后**必须**逐项重新验证：

| # | 契约 | 验证点 |
|---|---|---|
| 1 | 官方隐藏 file input | composer 工具行里仍有 `<input type="file">`（附件入口的地基） |
| 2 | slot `inject` 参数 | 仍是 `sessionId` 字符串；`sessions.scope(id)` 仍能换出 Context |
| 3 | `InputActions` 成员 | 仍无 `addFiles`；`addAttachments` 签名不变 |
| 4 | composer 编辑面 | 仍是 Lexical contenteditable（不是 textarea），Enter 语义不变 |
| 5 | 工具按钮焦点契约 | 官方仍用 `keepFocus`（若官方改了，我们要跟着改） |
| 6 | `busyEnter` 设置 | 命名空间 `ui-conversation` + 字段 `busyEnter`（`queue`/`steer`）不变 |
| 7 | `conversation` 服务 | 经 `ctx.inject` 获取为 READY（浮动日志看 apply 日志） |

**排查入口**：设置·General 开启「调试日志」，或 URL 加 `?debug=1`，右下角浮动面板会打出
每一步的状态（`[enter-newline]` 分支判定、`[图片] 已交给官方附件管线 N 个`、
`steer: 无法解析 session 作用域` 等），据此区分「服务未就绪」「API 漂移」还是「结构变更」。
调试完关掉开关即恢复常规界面。

> 桌面全宽窗口测不出移动端问题（媒体查询不命中）。测之前先确认视口 <1024px。
