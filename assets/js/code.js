// 替換原始的 code.js，此方案保留原始複製按鈕的支援，需要修改以下
//   1. USE_CUSTOM
//   2. toggle config/_default/markup.toml/codeFences
//
// 自訂版本於禁用 codeFences 時使用，禁用代表要求 Hugo 停止 code block 渲染
// 禁用的目的是改用 shiki 進行 syntax highlighting
const USE_CUSTOM = true;

function CodoCopyCustom() {
  // css 在 layouts/partials/custom/inject.html 設定
  for (const pre of document.querySelectorAll("pre")) {
    if (!pre.parentNode.classList.contains("code-block-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btnGroup = document.createElement("div");
      btnGroup.className = "button-group";

      const button = document.createElement("button");
      button.className = "copy-button-svg";
      button.innerHTML = `
      <svg aria-hidden="true" viewBox="0 0 24 24" class="copy-icon">
        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
      </svg>
      <svg class="check-icon" viewBox="0 0 24 24">
        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
      </svg>`;

      btnGroup.appendChild(button);
      wrapper.appendChild(btnGroup);

      button.addEventListener("click", () => {
        const codeEl = pre.querySelector("code");
        const codeText = codeEl ? codeEl.textContent : pre.textContent;

        navigator.clipboard.writeText(codeText).then(() => {
          const copyIcon = button.querySelector(".copy-icon");
          const checkIcon = button.querySelector(".check-icon");
          copyIcon.style.display = "none";
          checkIcon.style.display = "block";
          setTimeout(() => {
            copyIcon.style.display = "block";
            checkIcon.style.display = "none";
          }, 2000);
        });
      });
    }
  }
}

function CodoCopyOriginal() {
  var scriptBundle = document.getElementById("script-bundle");
  var copyText =
    scriptBundle && scriptBundle.getAttribute("data-copy")
      ? scriptBundle.getAttribute("data-copy")
      : "Copy";
  var copiedText =
    scriptBundle && scriptBundle.getAttribute("data-copied")
      ? scriptBundle.getAttribute("data-copied")
      : "Copied";

  function createCopyButton(highlightDiv) {
    const button = document.createElement("button");
    button.className = "copy-button";
    button.type = "button";
    button.ariaLabel = copyText;
    button.innerText = copyText;
    button.addEventListener("click", () => copyCodeToClipboard(button, highlightDiv));
    addCopyButtonToDom(button, highlightDiv);
  }

  async function copyCodeToClipboard(button, highlightDiv) {
    const codeToCopy = highlightDiv.querySelector(":last-child").innerText;
    try {
      result = await navigator.permissions.query({ name: "clipboard-write" });
      if (result.state == "granted" || result.state == "prompt") {
        await navigator.clipboard.writeText(codeToCopy);
      } else {
        copyCodeBlockExecCommand(codeToCopy, highlightDiv);
      }
    } catch (_) {
      copyCodeBlockExecCommand(codeToCopy, highlightDiv);
    } finally {
      codeWasCopied(button);
    }
  }

  function copyCodeBlockExecCommand(codeToCopy, highlightDiv) {
    const textArea = document.createElement("textArea");
    textArea.contentEditable = "true";
    textArea.readOnly = "false";
    textArea.className = "copy-textarea";
    textArea.value = codeToCopy;
    highlightDiv.insertBefore(textArea, highlightDiv.firstChild);
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    textArea.setSelectionRange(0, 999999);
    document.execCommand("copy");
    highlightDiv.removeChild(textArea);
  }

  function codeWasCopied(button) {
    button.blur();
    button.innerText = copiedText;
    setTimeout(function () {
      button.innerText = copyText;
    }, 2000);
  }

  function addCopyButtonToDom(button, highlightDiv) {
    highlightDiv.insertBefore(button, highlightDiv.firstChild);
    const wrapper = document.createElement("div");
    wrapper.className = "highlight-wrapper";
    highlightDiv.parentNode.insertBefore(wrapper, highlightDiv);
    wrapper.appendChild(highlightDiv);
  }

  document.querySelectorAll(".highlight").forEach((highlightDiv) => createCopyButton(highlightDiv));
}

// 根據開發者設置初始化相應版本
window.addEventListener("DOMContentLoaded", () => {
  if (USE_CUSTOM) {
    CodoCopyCustom();
  } else {
    CodoCopyOriginal();
  }
});
