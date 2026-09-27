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
var OWN_INPUT = "upload";
function findOfficialInput(start) {
  let node = start.parentElement;
  for (let depth = 0; node !== null && depth < 8; depth += 1, node = node.parentElement) {
    for (const candidate of node.querySelectorAll('input[type="file"]')) {
      if (candidate.dataset.mobileComposerInput === OWN_INPUT) continue;
      return candidate;
    }
  }
  return null;
}
function UploadButton({ t }) {
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
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      log("info", "\u9009\u62E9\u6587\u4EF6", files.length, "\u4E2A\uFF0C\u5176\u4E2D\u56FE\u7247", imageFiles.length, "\u4E2A");
      if (imageFiles.length === 0) {
        log("warn", "\u6CA1\u6709\u9009\u62E9\u6709\u6548\u7684\u56FE\u7247\u6587\u4EF6");
        return;
      }
      const official = findOfficialInput(input);
      if (official === null) {
        log("error", "\u672A\u627E\u5230\u5B98\u65B9\u9644\u4EF6 input\uFF0C\u65E0\u6CD5\u63D0\u4EA4\u56FE\u7247\uFF08DSH \u7ED3\u6784\u53EF\u80FD\u5DF2\u53D8\u66F4\uFF09");
        return;
      }
      const transfer = new DataTransfer();
      for (const file of imageFiles) transfer.items.add(file);
      official.files = transfer.files;
      official.dispatchEvent(new Event("change", { bubbles: true }));
      log("info", "\u5DF2\u4EA4\u7ED9\u5B98\u65B9\u9644\u4EF6\u7BA1\u7EBF", imageFiles.length, "\u4E2A");
    } catch (error) {
      log("error", "\u56FE\u7247\u4E0A\u4F20\u5931\u8D25:", error);
    } finally {
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }, []);
  const onClick = (0, import_react.useCallback)(() => {
    const input = fileRef.current;
    if (input) {
      input.value = "";
      input.click();
    }
  }, []);
  const keepFocus = (0, import_react.useCallback)((event) => {
    event.preventDefault();
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        ref: fileRef,
        type: "file",
        "data-mobile-composer-input": OWN_INPUT,
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
        onMouseDown: keepFocus,
        onClick,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": "true", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "rect",
            {
              x: "2",
              y: "3",
              width: "12",
              height: "10",
              rx: "1.6",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.4"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "5.9", cy: "6.5", r: "1.15", fill: "currentColor" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "path",
            {
              d: "M2.6 11.9l3.3-3.1 2.3 2.1 2.1-1.9 3.1 2.9",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.4",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ] })
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
var reported = /* @__PURE__ */ new Set();
function reportOnce(reason, message) {
  if (reported.has(reason)) return;
  reported.add(reason);
  log("warn", `[enter-newline] ${message}`);
}
function isEnterKey(event) {
  return event.key === "Enter" || event.code === "Enter" || event.keyCode === 13 || event.which === 13;
}
function isComposerEditable(target) {
  if (!target.isContentEditable) return false;
  if (target.closest("[data-input-scroll], [data-composer-card]") !== null) return true;
  let node = target;
  for (let depth = 0; node !== null && depth < 6; depth += 1, node = node.parentElement) {
    if (node.querySelector('input[type="file"]') !== null) return true;
  }
  return false;
}
function installEnterNewline() {
  const mq = window.matchMedia(MOBILE_QUERY);
  const onKeyDown = (event) => {
    if (!isEnterKey(event) || event.shiftKey) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!isComposerEditable(target)) {
      return;
    }
    if (!mq.matches) {
      reportOnce("wide", "\u5F53\u524D\u975E\u7A84\u5C4F\uFF08<1024px \u624D\u62E6\u622A\uFF09\uFF0CEnter \u4FDD\u6301\u5B98\u65B9\u8BED\u4E49");
      return;
    }
    if (event.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    event.stopPropagation();
    const synthetic = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    Object.defineProperty(synthetic, "keyCode", { get: () => 13 });
    Object.defineProperty(synthetic, "which", { get: () => 13 });
    target.dispatchEvent(synthetic);
    reportOnce("intercepted", "\u5DF2\u63A5\u7BA1 Enter\uFF08\u6539\u4E3A\u6362\u884C\uFF09");
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

// src/client/locales.ts
var NS = "mobileComposer";
var zh = {
  upload: "\u4E0A\u4F20\u56FE\u7247",
  attach: "\u6DFB\u52A0\u9644\u4EF6",
  steer: "\u63D2\u8BDD\u53D1\u9001",
  debugLog: "\u8C03\u8BD5\u65E5\u5FD7",
  debugLogDesc: "\u5728\u53F3\u4E0B\u89D2\u663E\u793A\u6D6E\u52A8\u8C03\u8BD5\u65E5\u5FD7\u9762\u677F\uFF08\u6392\u67E5\u4E0A\u4F20/API \u95EE\u9898\u7528\uFF09"
};
var en = {
  upload: "Upload image",
  attach: "Attach files",
  steer: "Steer send",
  debugLog: "Debug log",
  debugLogDesc: "Show a floating debug log panel (for troubleshooting uploads/API)"
};

// src/client/attach-button.ts
var PLUS_SELECTOR = 'button[aria-haspopup="listbox"]';
var ATTACH_SELECTOR = '[data-mobile-composer="attach"]';
var UPLOAD_SELECTOR = '[data-mobile-composer="upload"]';
var PAPERCLIP_PATH = "M5.5498 9.75V5H6.9502V9.75C6.9502 10.3299 7.4201 10.7998 8 10.7998C8.5799 10.7998 9.0498 10.3299 9.0498 9.75V4.5C9.0498 2.9536 7.7964 1.7002 6.25 1.7002C4.7036 1.7002 3.4502 2.9536 3.4502 4.5V9.75C3.4502 12.2629 5.4871 14.2998 8 14.2998C10.5129 14.2998 12.5498 12.2629 12.5498 9.75V4H13.9502V9.75C13.9502 13.0361 11.2861 15.7002 8 15.7002C4.71391 15.7002 2.0498 13.0361 2.0498 9.75V4.5C2.04981 2.1804 3.9304 0.299806 6.25 0.299805C8.5696 0.299805 10.4502 2.1804 10.4502 4.5V9.75C10.4502 11.1031 9.3531 12.2002 8 12.2002C6.6469 12.2002 5.5498 11.1031 5.5498 9.75Z";
function attachLabel() {
  const lang = (document.documentElement.lang || navigator.language || "").toLowerCase();
  return lang.startsWith("zh") ? zh.attach : en.attach;
}
function createAttachButton() {
  const label = attachLabel();
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.mobileComposer = "attach";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="${PAPERCLIP_PATH}" fill="currentColor"/></svg>`;
  return button;
}
function isPlusControl(element) {
  if (element === null) return false;
  if (element.matches(PLUS_SELECTOR)) return true;
  return element.querySelector(PLUS_SELECTOR) !== null;
}
function findToolRow(plus) {
  let node = plus.parentElement;
  for (let depth = 0; node !== null && depth < 6; depth += 1, node = node.parentElement) {
    if (node.querySelector(UPLOAD_SELECTOR) !== null) return node;
  }
  return null;
}
function syncToolRow(plus) {
  const row = findToolRow(plus);
  if (row === null) return;
  const existing = row.querySelector(ATTACH_SELECTOR);
  const input = row.querySelector('input[type="file"]');
  if (input === null) {
    existing?.remove();
    return;
  }
  let beforeInput = input.previousElementSibling;
  if (beforeInput !== null && beforeInput.matches(ATTACH_SELECTOR)) {
    beforeInput = beforeInput.previousElementSibling;
  }
  const officialPresent = !isPlusControl(beforeInput);
  if (officialPresent) {
    existing?.remove();
    return;
  }
  if (existing !== null) return;
  let anchor = plus;
  while (anchor.parentElement !== null && anchor.parentElement !== row) anchor = anchor.parentElement;
  const button = createAttachButton();
  button.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  button.addEventListener("click", () => {
    const target = row.querySelector('input[type="file"]');
    if (target !== null) target.click();
  });
  anchor.insertAdjacentElement("afterend", button);
}
function installAttachButton() {
  let scheduled = false;
  const sync = () => {
    for (const plus of document.querySelectorAll(PLUS_SELECTOR)) {
      try {
        syncToolRow(plus);
      } catch {
      }
    }
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      sync();
    }, 50);
  };
  sync();
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
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

// src/client/settings-meta.ts
var DEBUG_LOG_FIELD = "debugLog";

// src/client/forms-reader.ts
var PENDING_SNAPSHOT = {
  status: "loading",
  value: void 0,
  writable: false
};
function carriesField(section, field) {
  return typeof section === "object" && section !== null && Object.hasOwn(section, field);
}
var SharedFormsReader = class {
  forms;
  field;
  listeners = /* @__PURE__ */ new Set();
  unsubscribeMirror;
  unsubscribeForm;
  form;
  snapshot = PENDING_SNAPSHOT;
  constructor(forms, field) {
    this.forms = forms;
    this.field = field;
    this.unsubscribeMirror = forms.describe().subscribe(() => {
      this.bind();
      this.publish();
    });
    this.bind();
  }
  getSnapshot() {
    return this.snapshot;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  /**
   * 写一个字段（转发给绑定的 form）。
   * @returns Host 是否接受；未绑到 form 时返回 false（不排队）。
   */
  async set(field, value) {
    if (this.form === void 0) return false;
    return this.form.set(field, value);
  }
  /** 释放 mirror/form 订阅并清空监听者。 */
  dispose() {
    this.unsubscribeMirror();
    this.unsubscribeForm?.();
    this.unsubscribeForm = void 0;
    this.listeners.clear();
  }
  /** mirror 点名本插件 entry 后绑定其 form。 */
  bind() {
    if (this.form !== void 0) return;
    const namespaces = this.forms.describe().getSnapshot().view?.namespaces;
    const entry = namespaces?.find((candidate) => carriesField(candidate.value, this.field));
    if (entry === void 0) return;
    const form = this.forms.get(entry.ns);
    if (form === void 0) return;
    this.form = form;
    this.snapshot = form.getSnapshot();
    this.unsubscribeForm = form.subscribe(() => {
      this.snapshot = form.getSnapshot();
      this.publish();
    });
    this.publish();
  }
  publish() {
    for (const listener of this.listeners) listener();
  }
};

// src/client/index.tsx
var BUSY_ENTER_FIELD = "busyEnter";
var inject = ["slots", "locale", "conversation", "sessions", "configForms"];
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
/* 0.1.6 \u6CE8\u5165\u7684\u56DE\u5F62\u9488\uFF1A\u590D\u523B\u5B98\u65B9 .add \u5706\u5F62\u6309\u94AE\uFF0828px / selector \u586B\u5145 / primary \u5B57\u5F62\uFF09\u3002
   \u4E0E\u5B98\u65B9\u9644\u4EF6\u6309\u94AE\u540C\u6837\u5168\u5BBD\u5EA6\u53EF\u89C1\uFF08\u4E0D\u505A\u7A84\u5C4F\u9650\u5236\uFF09\uFF0C\u4FDD\u8BC1 track \u4E0E main \u5916\u89C2\u4E00\u81F4\u3002 */
[data-mobile-composer='attach'] {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-specific-selector);
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
}
[data-mobile-composer='attach']:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-solid);
}
[data-mobile-composer='attach']:disabled {
  opacity: 0.5;
  cursor: default;
}
@media (min-width: 1024px) {
  [data-mobile-composer='upload'],
  [data-mobile-composer='steer'] {
    display: none;
  }
}
/* \u7A84\u5C4F\u9690\u85CF\u725B\u9A6C\u4FEE\u4ED9\u770B\u677F\uFF08dsh-worktime-board\uFF09\u7684\u53F3\u4E0B\u89D2\u6D6E\u52A8\u5FBD\u6807\u3002
   \u5B83\u7684\u6837\u5F0F\u662F position:fixed; right:16px; bottom:16px; z-index:2147483000\uFF0C
   \u6B63\u597D\u538B\u5728 composer \u53F3\u4FA7\u7684\u300C\u53D1\u9001 / \u63D2\u8BDD\u300D\u6309\u94AE\u4E0A\uFF0C\u5BFC\u81F4\u6309\u94AE\u70B9\u4E0D\u5230\u3001\u4E5F\u770B\u4E0D\u89C1\u3002
   \u684C\u9762\u7AEF\u4E0D\u52A8\uFF08\u90A3\u91CC\u6709\u8DB3\u591F\u7A7A\u95F4\uFF09\u3002 */
@media (max-width: 1023px) {
  .wtb-badge {
    display: none !important;
  }
}
[data-dsh-shutdown-float] button {
  cursor: grab;
}
[data-dsh-shutdown-float] button:active {
  cursor: grabbing;
}
`;
function installMobileQueueDefault(ctx) {
  const mq = window.matchMedia("(max-width: 1023px)");
  const host = new SharedFormsReader(ctx.configForms, BUSY_ENTER_FIELD);
  let taken;
  const sync = () => {
    const current = host.getSnapshot().value?.busyEnter;
    if (mq.matches) {
      if (taken === void 0 && current === "steer") {
        taken = "steer";
        void host.set(BUSY_ENTER_FIELD, "queue");
      }
      return;
    }
    if (taken !== void 0) {
      const restore = taken;
      taken = void 0;
      void host.set(BUSY_ENTER_FIELD, restore);
    }
  };
  const unsubscribe = host.subscribe(sync);
  mq.addEventListener("change", sync);
  sync();
  return () => {
    unsubscribe();
    mq.removeEventListener("change", sync);
    host.dispose();
    if (taken !== void 0) void host.set(BUSY_ENTER_FIELD, taken);
  };
}
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
    scope.slots.inject("conversation.input.left", () => scope.slots.register({
      name: "conversation.input.left",
      id: "mobile-composer-upload",
      order: 0,
      locale: NS
    }, UploadButton));
    scope.slots.inject("conversation.input.right", () => scope.slots.register({
      name: "conversation.input.right",
      id: "mobile-composer-steer",
      order: 0,
      locale: NS,
      inject: (sessionId) => ({
        steer: () => {
          const conv = scope.get("conversation");
          const sessions = scope.get("sessions");
          const actx = sessions?.scope(sessionId);
          if (actx === void 0) {
            log("warn", "steer: \u65E0\u6CD5\u89E3\u6790 session \u4F5C\u7528\u57DF", sessionId);
            return;
          }
          void conv?.input.for(actx).submit("steer");
        }
      })
    }, SteerButton));
  });
  ctx.effect(() => installAttachButton(), "dsh-mobile-composer: attach-button(0.1.6)");
  ctx.effect(() => installEnterNewline(), "dsh-mobile-composer: enter-newline");
  ctx.effect(() => installMobileQueueDefault(ctx), "dsh-mobile-composer: mobile queue default");
  ctx.effect(() => installFloatDrag(), "dsh-mobile-composer: float-drag");
  if (new URLSearchParams(window.location.search).has("debug")) {
    ctx.effect(() => installLogPanel(), "dsh-mobile-composer: log-panel(force)");
  }
  const host = new SharedFormsReader(ctx.configForms, DEBUG_LOG_FIELD);
  ctx.effect(() => () => host.dispose(), "dsh-mobile-composer: debuglog reader");
  ctx.effect(() => {
    let disposePanel;
    const sync = () => {
      const snap = host.getSnapshot();
      const on = snap.value?.debugLog === true;
      if (on && !disposePanel) disposePanel = installLogPanel();
      else if (!on && disposePanel) {
        disposePanel();
        disposePanel = void 0;
      }
    };
    const unsub = host.subscribe(sync);
    sync();
    return () => {
      unsub();
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
