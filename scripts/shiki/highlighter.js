const { createHighlighter } = require("shiki");

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
    this.initShiki();
  }

  async initShiki() {
    this.shiki = await createHighlighter({
      themes: [this.CustomConfig.THEMES.LIGHT, this.CustomConfig.THEMES.DARK],
      langs: this.CustomConfig.LANGUAGES,
    });
  }

  async processCodeBlock($, codeBlock) {
    const pre = codeBlock.parent();
    if (pre.hasClass("shiki")) return false;

    const rawCode = codeBlock.text();
    // if (!rawCode.trim()) return false;  // respect empty block

    let lang = codeBlock.attr("class")?.replace(/^language-/, "") || "text";
    lang = this.CustomConfig.LANGUAGE_ALIAS[lang] || lang;

    try {
      this.shiki || (await this.initShiki());
      const html = await this.shiki.codeToHtml(rawCode, { lang, ...this.themeOption });
      pre.replaceWith(html);
      return true;
    } catch (error) {
      console.error(`Error processing code block (lang: ${lang}): ${error.message}`);
      return false;
    }
  }
}

module.exports = CodeHighlighter;
