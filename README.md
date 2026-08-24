# dsh-mobile-composer

DSH（DeepSeek Harness）移动端 UI 增强插件：让手机通过公网/局域网访问 DSH Web UI 时，获得接近桌面端的完整体验。

纯 Cordis 客户端插件，**不改官方源码**，通过官方槽位（slot）+ 服务面 + DOM 注入实现。

## 功能

| 功能 | 实现方式 |
|------|---------|
| 「+」号上传图片 | `conversation.input.left` 槽位注入回形针按钮，走 `inputActions.addImages` |
| 运行中插话发送 | `conversation.input.right` 槽位注入按钮，走 `conversation.input.for(ctx).submit('steer')` |
| 回车=换行 | document 捕获阶段拦截 keydown，窄屏下 Enter 只换行 |
| 退出按钮拖动 | DOM 注入 pointer 拖拽 + localStorage 位置记忆 |

四项均在 ≤1023px（移动端）生效，桌面端行为不变。

## 架构依据

DSH 官方暴露了三层可扩展面，本插件全部使用公开 API：

1. **槽位系统**：`ctx.slots.inject(slotName, factory)`，输入区有 `conversation.input.left`（工具行左）、`conversation.input.right`（发送按钮左）等 list 槽位。
2. **conversation 服务**：`ctx.conversation`（`IConversation`）公开 `input`（`SessionInputResolver`），其 `for(actx).submit('steer')` 即插话发送；`createDraftImages` 把 File 转成草稿图 id。
3. **session 标准 kit**：每个 session 槽位组件自动获得 `useInput` + `inputActions`（含 `addImages`）。

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
├── index.ts            # 主机侧空 apply（纯客户端插件）
└── client/
    ├── index.tsx       # apply + slot 注入 + 样式
    ├── locales.ts      # 文案
    ├── UploadButton.tsx# 传图按钮
    ├── SteerButton.tsx # 插话发送按钮
    ├── enter-newline.ts# 回车换行
    └── float-drag.ts   # 退出按钮拖动
```
