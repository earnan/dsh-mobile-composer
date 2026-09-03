window.__ModuleLoader__.load({ id: "@dsh-external/dsh-mobile-composer", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/UploadButton.tsx
var import_react = require("react");

// src/client/log-bus.ts
var listeners = /* @__PURE__ */ new Set();
var entries = [];
function log(level, ...args) {
  const message = args.map(formatArg).join(" ");
  entries = [...entries, { timestamp: Date.now(), level, message }].slice(-80);
  listeners.forEach((fn) => fn(entries));
}
function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function getEntries() {
  return entries;
}
function formatArg(arg) {
  if (typeof arg === "string") return arg;
  if (arg instanceof File) return "File(" + arg.name + ", " + arg.size + " bytes)";
  if (Array.isArray(arg)) return JSON.stringify(arg);
  if (arg && typeof arg === "object") return JSON.stringify(arg);
  return String(arg);
}

// src/client/UploadButton.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function UploadButton({ inputActions, createImages, t }) {
  const fileRef = (0, import_react.useRef)(null);
  const onPick = (0, import_react.useCallback)(() => {
    try {
      const input = fileRef.current;
      if (input === null) {
        log("warn", "\u6587\u4EF6\u8F93\u5165\u5143\u7D20\u4E0D\u5B58\u5728");
        return;
      }
      const files = Array.from(input.files ?? []);
      if (files.length === 0) {
        log("warn", "\u6CA1\u6709\u9009\u62E9\u6587\u4EF6");
        return;
      }
      log("info", "\u9009\u62E9\u6587\u4EF6", files.length, "\u4E2A");
      files.forEach((f, i) => log("info", "  \u6587\u4EF6[" + i + "]:", f.type, f.name, f.size + " bytes"));
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        log("warn", "\u6CA1\u6709\u9009\u62E9\u6709\u6548\u7684\u56FE\u7247\u6587\u4EF6");
        return;
      }
      log("info", "\u6709\u6548\u56FE\u7247\u6587\u4EF6", imageFiles.length, "\u4E2A");
      const images = createImages(imageFiles);
      log("info", "\u521B\u5EFA\u56FE\u7247", images.length, "\u4E2A");
      if (images.length > 0) {
        const ids = images.map((image) => image.id);
        log("info", "\u6DFB\u52A0\u56FE\u7247ID", ids);
        inputActions.addImages(ids);
        log("info", "\u56FE\u7247\u5DF2\u6DFB\u52A0\u5230\u8F93\u5165\u6846");
      } else {
        log("warn", "createImages \u8FD4\u56DE\u7A7A\u6570\u7EC4");
      }
    } catch (error) {
      log("error", "\u56FE\u7247\u4E0A\u4F20\u5931\u8D25:", error);
    } finally {
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }, [createImages, inputActions]);
  const onClick = (0, import_react.useCallback)(() => {
    const input = fileRef.current;
    if (input) {
      input.value = "";
      input.click();
    }
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        ref: fileRef,
        type: "file",
        accept: "image/jpeg,image/png,image/gif,image/webp",
        multiple: true,
        style: {
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          width: 0,
          height: 0,
          overflow: "hidden"
        },
        onChange: onPick
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        "data-mobile-composer": "upload",
        "aria-label": t("upload"),
        title: t("upload"),
        onClick,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "path",
          {
            d: "M5.5 8.5 8 11l2.5-2.5M8 3.5V11M3 12.5h10a1.5 1.5 0 0 0 1.5-1.5V5A1.5 1.5 0 0 0 13 3.5H9.2L8 2H4.5A1.5 1.5 0 0 0 3 3.5v7.5A1.5 1.5 0 0 0 4.5 12.5Z",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.4",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ) })
      }
    )
  ] });
}

// src/client/SteerButton.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function SteerButton({ session, input, steer, t }) {
  if (!session.running || session.subagent !== null) return null;
  const empty = input.draft.trim() === "" && input.imageIds.length === 0;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "button",
    {
      type: "button",
      "data-mobile-composer": "steer",
      "aria-label": t("steer"),
      title: t("steer"),
      disabled: empty,
      onClick: steer,
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { viewBox: "0 0 16 16", width: "16", height: "16", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "path",
        {
          d: "M8.3125 0.98c.355.073.667.224.95.452.225.181.468.426.717.675l4.728 4.728-1.414 1.414L9 3.956v11.086H7V3.956L2.707 8.248 1.293 6.835l4.728-4.728c.249-.249.492-.404.717-.563.239-.192.547-.388.95-.452.209-.033.415-.025.624 0Z",
          fill: "currentColor"
        }
      ) })
    }
  );
}

// src/client/DebugLogSetting.tsx
var import_react2 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function DebugLogSetting({ debugLog, onToggle, t }) {
  const [checked, setChecked] = (0, import_react2.useState)(debugLog);
  (0, import_react2.useEffect)(() => {
    setChecked(debugLog);
  }, [debugLog]);
  const handleChange = (value) => {
    setChecked(value);
    onToggle(value);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "label",
    {
      "data-mobile-composer": "debuglog-row",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        width: "100%",
        padding: "10px 0",
        cursor: "pointer"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { style: { minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "span",
            {
              style: {
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--dsw-alias-label-primary, #111)"
              },
              children: t("debugLog")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "span",
            {
              style: {
                display: "block",
                marginTop: "2px",
                fontSize: "12px",
                lineHeight: "1.4",
                color: "var(--dsw-alias-label-secondary, #666)"
              },
              children: t("debugLogDesc")
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            type: "checkbox",
            checked,
            onChange: (e) => handleChange(e.target.checked),
            style: { flex: "none", width: "20px", height: "20px" }
          }
        )
      ]
    }
  );
}

// src/client/enter-newline.ts
var MOBILE_QUERY = "(max-width: 1023px)";
function installEnterNewline() {
  const mq = window.matchMedia(MOBILE_QUERY);
  const onKeyDown = (event) => {
    if (!mq.matches) return;
    if (event.key !== "Enter" || event.shiftKey) return;
    const target = event.target;
    if (target === null || target.tagName !== "TEXTAREA") return;
    if (target.closest("[data-composer-card]") === null) return;
    if (event.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    event.stopPropagation();
    const textarea = target;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? start;
    const next = textarea.value.slice(0, start) + "\n" + textarea.value.slice(end);
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;
    if (setter !== void 0) setter.call(textarea, next);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.setSelectionRange(start + 1, start + 1);
  };
  document.addEventListener("keydown", onKeyDown, true);
  return () => {
    document.removeEventListener("keydown", onKeyDown, true);
  };
}

// src/client/float-drag.ts
var STORAGE_KEY = "dsh-mobile-composer:shutdown-pos";
var DRAG_THRESHOLD = 4;
var BUTTON_SELECTOR = "[data-dsh-shutdown-float] button";
function installFloatDrag() {
  let button = null;
  let cleanup;
  let observer;
  const arm = () => {
    if (button !== null) return;
    const host = document.querySelector(BUTTON_SELECTOR);
    if (host === null) return;
    button = host;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const [x, y] = saved.split(",").map(Number);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        button.style.right = "auto";
        button.style.bottom = "auto";
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
      }
    }
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    const onDown = (event) => {
      if (event.button !== 0 || button === null) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      const rect = button.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
      button.setPointerCapture(event.pointerId);
    };
    const onMove = (event) => {
      if (!dragging || button === null) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      moved = true;
      button.style.right = "auto";
      button.style.bottom = "auto";
      button.style.left = `${originX + dx}px`;
      button.style.top = `${originY + dy}px`;
    };
    const onUp = (event) => {
      if (!dragging) return;
      dragging = false;
      if (moved && button !== null) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        localStorage.setItem(STORAGE_KEY, `${originX + dx},${originY + dy}`);
        const suppress = (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        button.addEventListener("click", suppress, { capture: true, once: true });
      }
    };
    button.addEventListener("pointerdown", onDown);
    button.addEventListener("pointermove", onMove);
    button.addEventListener("pointerup", onUp);
    button.addEventListener("pointercancel", onUp);
    cleanup = () => {
      if (button !== null) {
        button.removeEventListener("pointerdown", onDown);
        button.removeEventListener("pointermove", onMove);
        button.removeEventListener("pointerup", onUp);
        button.removeEventListener("pointercancel", onUp);
      }
      button = null;
    };
  };
  const scan = () => {
    const current = document.querySelector(BUTTON_SELECTOR);
    if (current !== button) {
      cleanup?.();
      cleanup = void 0;
      arm();
    }
  };
  observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true });
  scan();
  return () => {
    observer?.disconnect();
    observer = void 0;
    cleanup?.();
    cleanup = void 0;
  };
}

// src/client/log-panel.ts
function installLogPanel() {
  const panel = document.createElement("div");
  panel.dataset.mobileComposerLog = "panel";
  panel.style.cssText = [
    "position: fixed",
    "bottom: 70px",
    "right: 12px",
    "z-index: 2147483647",
    "max-width: 300px",
    "max-height: 240px",
    "overflow: auto",
    "background: rgba(0,0,0,0.88)",
    "color: #e8e8e8",
    "font-family: ui-monospace, monospace",
    "font-size: 11px",
    "line-height: 1.5",
    "border-radius: 8px",
    "padding: 8px",
    "display: none",
    "pointer-events: auto"
  ].join(";");
  const toggle = document.createElement("button");
  toggle.dataset.mobileComposerLog = "toggle";
  toggle.textContent = "\u8C03\u8BD5\u65E5\u5FD7";
  toggle.style.cssText = [
    "position: fixed",
    "bottom: 16px",
    "right: 16px",
    "z-index: 2147483647",
    "background: rgba(0,0,0,0.72)",
    "color: #fff",
    "border: 1px solid rgba(255,255,255,0.35)",
    "border-radius: 20px",
    "padding: 7px 14px",
    "font-size: 12px",
    "font-family: system-ui, sans-serif",
    "cursor: pointer",
    "pointer-events: auto"
  ].join(";");
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "\u6E05\u7A7A";
  clearBtn.style.cssText = [
    "background: rgba(255,107,107,0.2)",
    "color: #ff6b6b",
    "border: none",
    "border-radius: 4px",
    "padding: 2px 8px",
    "font-size: 11px",
    "cursor: pointer",
    "margin-left: 6px"
  ].join(";");
  const header = document.createElement("div");
  header.textContent = "DSH \u8C03\u8BD5\u65E5\u5FD7";
  header.style.cssText = [
    "display: flex",
    "align-items: center",
    "justify-content: space-between",
    "margin-bottom: 6px",
    "font-weight: 600",
    "font-size: 12px"
  ].join(";");
  header.appendChild(clearBtn);
  const content = document.createElement("div");
  content.dataset.mobileComposerLog = "content";
  content.textContent = "\u6682\u65E0\u65E5\u5FD7";
  content.style.cssText = [
    "white-space: pre-wrap",
    "word-break: break-all"
  ].join(";");
  panel.appendChild(header);
  panel.appendChild(content);
  document.body.appendChild(panel);
  document.body.appendChild(toggle);
  let badge = 0;
  const setBadge = () => {
    toggle.textContent = badge > 0 ? "\u8C03\u8BD5\u65E5\u5FD7 (" + badge + ")" : "\u8C03\u8BD5\u65E5\u5FD7";
  };
  const render = (list) => {
    if (list.length === 0) {
      content.textContent = "\u6682\u65E0\u65E5\u5FD7";
      return;
    }
    content.innerHTML = list.map((e) => {
      const color = e.level === "error" ? "#ff6b6b" : e.level === "warn" ? "#ffd93d" : "#7ec699";
      const time = new Date(e.timestamp).toLocaleTimeString();
      return '<div style="color:' + color + ';margin-bottom:2px"><span style="opacity:0.6">[' + time + "]</span> " + escapeHtml(e.message) + "</div>";
    }).join("");
  };
  const isOpen = () => panel.style.display !== "none";
  const toggleOpen = () => {
    const open = isOpen();
    panel.style.display = open ? "none" : "block";
    if (!open) {
      badge = 0;
      setBadge();
    }
  };
  toggle.addEventListener("click", toggleOpen);
  clearBtn.addEventListener("click", () => {
    content.textContent = "\u6682\u65E0\u65E5\u5FD7";
  });
  const unsubscribe = subscribe((list) => {
    render(list);
    if (!isOpen()) {
      badge++;
      setBadge();
    }
  });
  render(getEntries());
  return () => {
    unsubscribe();
    panel.remove();
    toggle.remove();
  };
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// src/client/locales.ts
var NS = "mobileComposer";
var zh = {
  upload: "\u4E0A\u4F20\u56FE\u7247",
  steer: "\u63D2\u8BDD\u53D1\u9001",
  debugLog: "\u8C03\u8BD5\u65E5\u5FD7",
  debugLogDesc: "\u5728\u53F3\u4E0B\u89D2\u663E\u793A\u6D6E\u52A8\u8C03\u8BD5\u65E5\u5FD7\u9762\u677F\uFF08\u6392\u67E5\u4E0A\u4F20/API \u95EE\u9898\u7528\uFF09"
};
var en = {
  upload: "Upload image",
  steer: "Steer send",
  debugLog: "Debug log",
  debugLogDesc: "Show a floating debug log panel (for troubleshooting uploads/API)"
};

// src/client/settings-meta.ts
var MOBILE_COMPOSER_SETTINGS_NAMESPACE = "mobile-composer";

// src/client/index.tsx
var inject = ["slots", "locale", "conversation", "sessions", "remote", "settingsScope"];
var MOBILE_CSS = `[data-mobile-composer='upload'],
[data-mobile-composer='steer'] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: currentColor;
  cursor: pointer;
  flex: none;
}
[data-mobile-composer='upload']:hover:not(:disabled),
[data-mobile-composer='steer']:hover:not(:disabled) {
  background: rgba(127, 127, 127, 0.16);
}
[data-mobile-composer='steer']:disabled {
  opacity: 0.35;
  cursor: default;
}
@media (min-width: 1024px) {
  [data-mobile-composer='upload'],
  [data-mobile-composer='steer'] {
    display: none;
  }
}
[data-dsh-shutdown-float] button {
  cursor: grab;
}
[data-dsh-shutdown-float] button:active {
  cursor: grabbing;
}
`;
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-mobile-composer: dictionaries");
  ctx.effect(() => {
    const tag = document.createElement("style");
    tag.dataset.plugin = "@dsh-external/dsh-mobile-composer";
    tag.textContent = MOBILE_CSS;
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, "dsh-mobile-composer: styles");
  ctx.inject(["conversation", "sessions"], (scope) => {
    const conversation = scope.get("conversation");
    log("info", "apply: conversation =", conversation ? "READY" : "MISSING");
    log("info", "apply: createDraftImages =", conversation && typeof conversation.createDraftImages === "function" ? "READY" : "MISSING");
    scope.slots.inject("conversation.input.left", () => scope.slots.register({
      name: "conversation.input.left",
      id: "mobile-composer-upload",
      order: 0,
      locale: NS,
      inject: () => ({
        createImages: (files) => {
          const conv = scope.get("conversation");
          log("info", "createImages: conversation =", conv ? "READY" : "MISSING");
          if (!conv) {
            log("error", "createImages: conversation \u672A\u627E\u5230");
            return [];
          }
          if (typeof conv.createDraftImages !== "function") {
            log("error", "createImages: createDraftImages \u4E0D\u53EF\u7528");
            return [];
          }
          try {
            const result = conv.createDraftImages(files);
            log("info", "createImages: createDraftImages \u8FD4\u56DE", result.length, "\u4E2A");
            return result;
          } catch (e) {
            log("error", "createImages: createDraftImages \u5F02\u5E38:", e);
            return [];
          }
        }
      })
    }, UploadButton));
    scope.slots.inject("conversation.input.right", () => scope.slots.register({
      name: "conversation.input.right",
      id: "mobile-composer-steer",
      order: 0,
      locale: NS,
      inject: (actx) => ({
        steer: () => {
          const conv = scope.get("conversation");
          void conv?.input.for(actx).submit("steer");
        }
      })
    }, SteerButton));
  });
  ctx.effect(() => installEnterNewline(), "dsh-mobile-composer: enter-newline");
  ctx.effect(() => installFloatDrag(), "dsh-mobile-composer: float-drag");
  if (new URLSearchParams(window.location.search).has("debug")) {
    ctx.effect(() => installLogPanel(), "dsh-mobile-composer: log-panel(force)");
  }
  const host = ctx.settingsScope.bind({
    namespace: MOBILE_COMPOSER_SETTINGS_NAMESPACE
  });
  ctx.effect(() => {
    let disposePanel;
    let unsub;
    const sync = () => {
      const snap = host.getSnapshot();
      const on = snap.value?.debugLog === true;
      if (on && !disposePanel) disposePanel = installLogPanel();
      else if (!on && disposePanel) {
        disposePanel();
        disposePanel = void 0;
      }
    };
    unsub = host.subscribe(sync);
    sync();
    return () => {
      unsub?.();
      if (disposePanel) disposePanel();
    };
  }, "dsh-mobile-composer: log-panel(settings)");
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "mobile-composer-debuglog",
    order: 0,
    locale: NS,
    inject: () => ({
      debugLog: host.getSnapshot().value?.debugLog === true,
      onToggle: (v) => {
        void host.set("debugLog", v);
      }
    })
  }, DebugLogSetting));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
