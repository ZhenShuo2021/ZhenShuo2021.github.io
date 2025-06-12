import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.esm.min.mjs";

function getMermaidTheme() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "default";
}

function renderMermaid() {
    document.querySelectorAll("pre.mermaid").forEach((element) => {
        if (!element.getAttribute("data-original")) {
            element.setAttribute("data-original", element.textContent.trim());
        }

        element.removeAttribute("data-processed");
        element.textContent = element.getAttribute("data-original");
    });

    mermaid.initialize({
        startOnLoad: false,
        theme: getMermaidTheme(),
    });

    mermaid.run();
}

document.addEventListener("DOMContentLoaded", renderMermaid);

const themeSwitcher = document.getElementById("theme-switcher");
if (themeSwitcher) {
    themeSwitcher.addEventListener("click", () => {
        setTimeout(renderMermaid, 100);
    });
}
