// #JoaoVictor #Tecnologia #Branding
export function initializeTextEffects(): () => void {
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>("[data-text-effect]"),
  );
  if (!targets.length) return () => {};
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let stop = () => {};

  function start() {
    stop();
    if (
      preference.matches ||
      !("IntersectionObserver" in window) ||
      !("animate" in Element.prototype)
    )
      return;

    const controller = new AbortController();
    const animations = new Set<Animation>();
    let frame = 0;
    const highlights = targets.filter(
      (target) => target.dataset.textEffect === "highlight",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (controller.signal.aborted) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          observer.unobserve(target);
          target.dataset.textRevealed = "true";
          target
            .querySelectorAll<HTMLElement>(".text-word")
            .forEach((word, i) => {
              const animation = word.animate(
                [
                  {
                    opacity: 0,
                    transform: "translateY(0.25em)",
                    filter: "blur(4px)",
                  },
                  { opacity: 1, transform: "none", filter: "blur(0px)" },
                ],
                {
                  duration: 560,
                  delay: Math.min(i * 28, 240),
                  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                  fill: "backwards",
                },
              );
              animations.add(animation);
              animation.addEventListener(
                "finish",
                () => animations.delete(animation),
                {
                  once: true,
                  signal: controller.signal,
                },
              );
            });
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    // Only react to scrolling; there is no perpetual animation loop.
    const updateHighlights = () => {
      if (controller.signal.aborted) return;
      frame = 0;
      const height = window.innerHeight;
      for (const target of highlights) {
        const progress = Math.max(
          0,
          Math.min(
            1,
            (height * 0.85 - target.getBoundingClientRect().top) /
              (height * 0.4),
          ),
        );
        const words = target.querySelectorAll<HTMLElement>(".text-word");
        words.forEach((word, i) => {
          word.classList.toggle("is-lit", progress >= (i + 1) / words.length);
        });
        target.classList.add("is-enhanced");
      }
    };
    const scheduleHighlights = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHighlights);
    };

    targets
      .filter((target) => target.dataset.textEffect === "reveal")
      .forEach((target) => observer.observe(target));
    if (highlights.length) {
      updateHighlights();
      window.addEventListener("scroll", scheduleHighlights, {
        passive: true,
        signal: controller.signal,
      });
      window.addEventListener("resize", scheduleHighlights, {
        signal: controller.signal,
      });
    }

    stop = () => {
      controller.abort();
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      targets.forEach((target) => {
        delete target.dataset.textRevealed;
        target.classList.remove("is-enhanced");
        target
          .querySelectorAll(".text-word")
          .forEach((word) => word.classList.remove("is-lit"));
      });
    };
  }

  preference.addEventListener("change", start);
  start();
  return () => {
    stop();
    preference.removeEventListener("change", start);
  };
}
