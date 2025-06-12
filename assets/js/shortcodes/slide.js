document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".embla").forEach((emblaNode) => {
        const viewport = emblaNode.querySelector(".embla__viewport");
        const prevBtn = emblaNode.querySelector(".embla__button--prev");
        const nextBtn = emblaNode.querySelector(".embla__button--next");
        const captions = emblaNode.querySelectorAll(".embla__caption");

        if (!viewport || !prevBtn || !nextBtn) return;

        let embla;
        try {
            embla = EmblaCarousel(viewport, {
                loop: true,
                align: "center",
                containScroll: "trimSnaps",
                slidesToScroll: 1,
            });
        } catch (e) {
            return;
        }

        prevBtn.addEventListener("click", () => embla.scrollPrev());
        nextBtn.addEventListener("click", () => embla.scrollNext());

        const updateCaption = () => {
            const selectedIndex = embla.selectedScrollSnap();
            captions.forEach((caption, index) => {
                caption.style.display = index === selectedIndex ? "block" : "none";
            });
        };

        embla.on("select", updateCaption);
        embla.on("reInit", updateCaption);
        updateCaption();
    });
});
