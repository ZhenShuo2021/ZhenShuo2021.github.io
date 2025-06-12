document.addEventListener("DOMContentLoaded", () => {
    const tocFloating = document.querySelector(".toc-floating");
    const tocToggle = document.querySelector(".toc-toggle");
    if (!tocFloating || !tocToggle) return;

    initTocToggle();
    initScrollHighlight();

    function initTocToggle() {
        const isPinned = localStorage.getItem("toc-pinned") === "true";
        if (isPinned) {
            tocFloating.classList.add("toc-pinned");
            tocToggle.classList.add("active");
        }

        tocToggle.addEventListener("click", () => {
            const willPin = !tocFloating.classList.contains("toc-pinned");
            tocFloating.classList.toggle("toc-pinned");
            tocToggle.classList.toggle("active");
            localStorage.setItem("toc-pinned", willPin.toString());
        });
    }

    function initScrollHighlight() {
        const tocLinks = Array.from(document.querySelectorAll(".toc-floating a[href^='#']"));
        const headings = getHeadings(tocLinks);
        if (headings.length === 0) return;

        window.addEventListener("scroll", () => updateHighlight(headings, tocLinks));
    }

    function getHeadings(tocLinks) {
        return tocLinks
            .map((link) => {
                const targetId = link.getAttribute("href").substring(1);
                const element = document.getElementById(targetId);
                return element ? { element, link } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.element.offsetTop - b.element.offsetTop);
    }

    function updateHighlight(headings, tocLinks) {
        const scrollTop = window.pageYOffset;
        const currentHeading = findCurrentHeading(headings, scrollTop);

        tocLinks.forEach((link) => link.classList.remove("active"));
        if (currentHeading) {
            currentHeading.link.classList.add("active");
        }
    }

    function findCurrentHeading(headings, scrollTop) {
        if (isAtBottom()) {
            return headings[headings.length - 1];
        }

        for (let i = headings.length - 1; i >= 0; i--) {
            if (scrollTop >= headings[i].element.offsetTop - 100) {
                return headings[i];
            }
        }

        return null;
    }

    function isAtBottom() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        return scrollTop + windowHeight >= documentHeight - 10;
    }
});
