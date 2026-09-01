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
var import_jsx_runtime = require("react/jsx-runtime");
function UploadButton({ inputActions, createImages, t }) {
  const fileRef = (0, import_react.useRef)(null);
  const onPick = (0, import_react.useCallback)(() => {
    try {
      const input = fileRef.current;
      if (input === null) {
        console.warn("dsh-mobile-composer: \u6587\u4EF6\u8F93\u5165\u5143\u7D20\u4E0D\u5B58\u5728");
        return;
      }
      const files = Array.from(input.files ?? []);
      if (files.length === 0) {
        console.warn("dsh-mobile-composer: \u6CA1\u6709\u9009\u62E9\u6587\u4EF6");
        return;
      }
      console.log("dsh-mobile-composer: \u9009\u62E9\u6587\u4EF6", files.length, "\u4E2A");
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        console.warn("dsh-mobile-composer: \u6CA1\u6709\u9009\u62E9\u6709\u6548\u7684\u56FE\u7247\u6587\u4EF6");
        return;
      }
      console.log("dsh-mobile-composer: \u6709\u6548\u56FE\u7247\u6587\u4EF6", imageFiles.length, "\u4E2A");
      const images = createImages(imageFiles);
      console.log("dsh-mobile-composer: \u521B\u5EFA\u56FE\u7247", images.length, "\u4E2A");
      if (images.length > 0) {
        const ids = images.map((image) => image.id);
        console.log("dsh-mobile-composer: \u6DFB\u52A0\u56FE\u7247ID", ids);
        inputActions.addImages(ids);
      }
    } catch (error) {
      console.error("dsh-mobile-composer: \u56FE\u7247\u4E0A\u4F20\u5931\u8D25", error);
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

// src/client/locales.ts
var NS = "mobileComposer";
var zh = {
  upload: "\u4E0A\u4F20\u56FE\u7247",
  steer: "\u63D2\u8BDD\u53D1\u9001"
};
var en = {
  upload: "Upload image",
  steer: "Steer send"
};

// src/client/index.tsx
var inject = ["slots", "locale"];
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
  const conversation = ctx.get("conversation");
  const sessions = ctx.get("sessions");
  ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
    name: "conversation.input.left",
    id: "mobile-composer-upload",
    order: 0,
    locale: NS,
    inject: () => ({
      createImages: (files) => conversation?.createDraftImages(files) ?? []
    })
  }, UploadButton));
  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
    name: "conversation.input.right",
    id: "mobile-composer-steer",
    order: 0,
    locale: NS,
    inject: (actx) => ({
      steer: () => {
        conversation?.input.for(actx).submit("steer");
      }
    })
  }, SteerButton));
  ctx.effect(() => installEnterNewline(), "dsh-mobile-composer: enter-newline");
  ctx.effect(() => installFloatDrag(), "dsh-mobile-composer: float-drag");
}
return module.exports; } });
//# sourceMappingURL=client.js.map
