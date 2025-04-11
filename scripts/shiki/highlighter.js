const fs = require("node:fs/promises");
const render = require("dom-serializer").default;
const { createHighlighter } = require("shiki");
const { parseDocument } = require("htmlparser2");
const { decode } = require("html-entities");
const { DomUtils } = require("htmlparser2");

class CodeHighlighter {
  constructor(CustomConfig) {
    this.CustomConfig = CustomConfig;
    this.themeOption = this.CustomConfig.ENABLE_DUAL_THEME
      ? {
          themes: {
            light: this.CustomConfig.THEMES.LIGHT,
            dark: this.CustomConfig.THEMES.DARK,
          },
        }
      : { theme: this.CustomConfig.THEMES.LIGHT };
    this.shiki = null;
  }

  async initShiki() {
    if (this.shiki) return;

    this.shiki = await createHighlighter({
      themes: [this.CustomConfig.THEMES.LIGHT, this.CustomConfig.THEMES.DARK],
      langs: this.CustomConfig.LANGUAGES,
    });
  }

  async processFile(filePath) {
    const html = await fs.readFile(filePath, "utf8");

    // quick filter: 300ms (15%) improvements on large repo
    if (!html.includes("<pre><code") || html.includes('<pre class="shiki')) return 0;

    const dom = parseDocument(html, { decodeEntities: false });
    const nodes = [];

    for (const el of DomUtils.findAll((el) => el.name === "pre", dom.children)) {
      if (el.attribs?.class?.includes("shiki")) return 0; // 已經被處理過
      const codeNode = el.children?.find((child) => child.name === "code"); // 找到 tag code
      if (codeNode) nodes.push(codeNode);
    }

    if (nodes.length === 0) return 0;

    let modified = 0;
    for (const code of nodes) {
      const pre = code.parent;
      const rawCode = decode(DomUtils.textContent(code));

      let lang = code.attribs?.class?.replace(/^language-/, "") || "text";
      lang = this.CustomConfig.LANGUAGE_ALIAS[lang] || lang;

      try {
        const highlighted = await this.shiki.codeToHtml(rawCode, { lang, ...this.themeOption });
        const newDom = parseDocument(highlighted, { decodeEntities: false }).children;
        DomUtils.replaceElement(pre, newDom[0]);
        modified++;
      } catch (e) {
        console.error(`Error highlighting code block (${lang}): ${e.message}`);
      }
    }

    if (modified > 0) {
      const updated = render(dom, { decodeEntities: false });
      await fs.writeFile(filePath, updated, "utf8");
    }

    return modified;
  }
}

module.exports = CodeHighlighter;
