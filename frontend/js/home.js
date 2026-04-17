(function () {
  const body = document.body;

  if (!body || !body.classList.contains("landing-page")) {
    return;
  }

  const root = document.documentElement;
  const journeySection = document.getElementById("home-journey");
  const journeyPin = journeySection ? journeySection.querySelector(".journey-pin") : null;
  const journeyDevice = journeySection ? journeySection.querySelector("[data-journey-device]") : null;
  const journeySteps = Array.from(document.querySelectorAll("[data-journey-step]"));
  const journeyStates = Array.from(document.querySelectorAll("[data-journey-state]"));
  const journeyDots = Array.from(document.querySelectorAll("[data-journey-dot]"));
  let currentJourneyStage = 0;

  function syncThemeState() {
    const computed = window.getComputedStyle(root);
    const primaryRgb = computed.getPropertyValue("--primary-rgb").trim();

    if (primaryRgb) {
      body.style.setProperty("--home-primary-rgb-live", primaryRgb);
    }

    if (window.ScrollTrigger) {
      window.requestAnimationFrame(function () {
        window.ScrollTrigger.refresh();
      });
    }
  }

  function toggleJourneyClasses(index) {
    journeySteps.forEach(function (step, stepIndex) {
      step.classList.toggle("is-active", stepIndex === index);
    });

    journeyDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function setJourneyStage(index, options) {
    const animate = !options || options.animate !== false;
    const gsapRef = options ? options.gsap : null;

    if (!journeyStates.length || index === currentJourneyStage && animate) {
      toggleJourneyClasses(index);
      return;
    }

    currentJourneyStage = index;
    toggleJourneyClasses(index);

    journeyStates.forEach(function (state, stateIndex) {
      const isActive = stateIndex === index;

      state.classList.toggle("is-active", isActive);

      if (!gsapRef || !animate) {
        state.style.opacity = isActive ? "1" : "0";
        state.style.visibility = isActive ? "visible" : "hidden";
        state.style.transform = isActive ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 18px, 0) scale(0.96)";
        return;
      }

      gsapRef.to(state, {
        autoAlpha: isActive ? 1 : 0,
        y: isActive ? 0 : stateIndex < index ? -18 : 18,
        scale: isActive ? 1 : 0.96,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
        onStart: function () {
          if (isActive) {
            state.classList.add("is-active");
          }
        },
        onComplete: function () {
          if (!isActive) {
            state.classList.remove("is-active");
          }
        }
      });
    });
  }

  function formatCounter(value, decimals, suffix) {
    if (decimals > 0) {
      return value.toFixed(decimals) + suffix;
    }

    return Math.round(value).toString() + suffix;
  }

  function initCounters(gsapRef, ScrollTriggerRef, reduceMotion) {
    document.querySelectorAll("[data-counter-to]").forEach(function (element) {
      const target = Number(element.getAttribute("data-counter-to") || "0");
      const decimals = Number(element.getAttribute("data-counter-decimals") || "0");
      const suffix = element.getAttribute("data-counter-suffix") || "";

      if (reduceMotion) {
        element.textContent = formatCounter(target, decimals, suffix);
        return;
      }

      ScrollTriggerRef.create({
        trigger: element,
        start: "top 82%",
        once: true,
        onEnter: function () {
          const counter = { value: 0 };

          gsapRef.to(counter, {
            value: target,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: function () {
              element.textContent = formatCounter(counter.value, decimals, suffix);
            }
          });
        }
      });
    });
  }

  function initHeroEntrance(gsapRef, reduceMotion) {
    if (reduceMotion) {
      return;
    }

    const heroTimeline = gsapRef.timeline({
      defaults: {
        duration: 0.82,
        ease: "power3.out"
      }
    });

    heroTimeline
      .from("[data-hero-badge]", { y: 24, autoAlpha: 0 })
      .from("[data-hero-brand]", { y: 30, autoAlpha: 0 }, "-=0.52")
      .from("[data-hero-title]", { y: 42, autoAlpha: 0 }, "-=0.52")
      .from("[data-hero-copy]", { y: 26, autoAlpha: 0 }, "-=0.48")
      .from("[data-hero-actions]", { y: 22, autoAlpha: 0 }, "-=0.45")
      .from("[data-hero-points] li", { y: 16, autoAlpha: 0, stagger: 0.1 }, "-=0.36")
      .from("[data-hero-device]", { y: 54, autoAlpha: 0, scale: 0.94, rotate: -4 }, "-=0.92")
      .from("[data-hero-chip]", { autoAlpha: 0, x: 18, y: 18, stagger: 0.12 }, "-=0.65");

    gsapRef.to("[data-hero-chip]", {
      y: function (index) {
        return index % 2 === 0 ? -10 : 10;
      },
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      stagger: 0.18,
      ease: "sine.inOut"
    });

    gsapRef.to(".landing-hero-glow-one", {
      x: -14,
      y: 16,
      scale: 1.04,
      duration: 4.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsapRef.to(".landing-hero-glow-two", {
      x: 12,
      y: -10,
      scale: 1.06,
      duration: 5.1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  function initRevealBatches(gsapRef, ScrollTriggerRef, reduceMotion) {
    if (reduceMotion) {
      return;
    }

    ScrollTriggerRef.batch("[data-home-reveal]", {
      start: "top 84%",
      once: true,
      onEnter: function (batch) {
        gsapRef.from(batch, {
          y: 36,
          autoAlpha: 0,
          duration: 0.82,
          ease: "power3.out",
          stagger: 0.12,
          overwrite: "auto",
          clearProps: "transform,opacity,visibility"
        });
      }
    });
  }

  function initHeroScroll(gsapRef, ScrollTriggerRef, reduceMotion) {
    if (reduceMotion) {
      return;
    }

    gsapRef.to("[data-hero-device]", {
      yPercent: -6,
      rotate: -1.5,
      ease: "none",
      scrollTrigger: {
        trigger: "#landing-hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    gsapRef.to("[data-hero-chip]", {
      yPercent: function (index) {
        return index % 2 === 0 ? -18 : 16;
      },
      ease: "none",
      scrollTrigger: {
        trigger: "#landing-hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.1
      }
    });
  }

  function initJourney(gsapRef, ScrollTriggerRef, isDesktop, reduceMotion) {
    if (!journeySection || !journeyPin || !journeyDevice || !journeySteps.length || !journeyStates.length) {
      return;
    }

    setJourneyStage(0, { animate: false });

    if (reduceMotion) {
      journeySteps.forEach(function (step, index) {
        ScrollTriggerRef.create({
          trigger: step,
          start: "top 70%",
          end: "bottom 40%",
          onEnter: function () {
            setJourneyStage(index, { animate: false });
          },
          onEnterBack: function () {
            setJourneyStage(index, { animate: false });
          }
        });
      });

      return;
    }

    if (isDesktop) {
      const journeyTimeline = gsapRef.timeline({
        scrollTrigger: {
          trigger: journeySection,
          start: "top top+=96",
          end: "+=1800",
          pin: journeyPin,
          scrub: 0.9,
          anticipatePin: 1
        }
      });

      journeyTimeline
        .call(function () {
          setJourneyStage(0, { gsap: gsapRef });
        }, null, 0)
        .to(journeyDevice, { yPercent: -3, rotation: -1.4, duration: 1 }, 0)
        .call(function () {
          setJourneyStage(1, { gsap: gsapRef });
        }, null, 1)
        .to(journeyDevice, { yPercent: 1.5, rotation: 1, duration: 1 }, 1)
        .call(function () {
          setJourneyStage(2, { gsap: gsapRef });
        }, null, 2)
        .to(journeyDevice, { yPercent: -1.5, rotation: -0.6, duration: 1 }, 2);

      return;
    }

    gsapRef.from(journeyDevice, {
      y: 42,
      autoAlpha: 0,
      duration: 0.82,
      ease: "power3.out",
      scrollTrigger: {
        trigger: journeyDevice,
        start: "top 84%",
        once: true
      }
    });

    journeySteps.forEach(function (step, index) {
      ScrollTriggerRef.create({
        trigger: step,
        start: "top 72%",
        end: "bottom 45%",
        onEnter: function () {
          setJourneyStage(index, { gsap: gsapRef });
        },
        onEnterBack: function () {
          setJourneyStage(index, { gsap: gsapRef });
        }
      });
    });
  }

  syncThemeState();
  document.addEventListener("mm:themechange", syncThemeState);

  if (!window.gsap || !window.ScrollTrigger) {
    setJourneyStage(0, { animate: false });
    return;
  }

  const gsapRef = window.gsap;
  const ScrollTriggerRef = window.ScrollTrigger;

  gsapRef.registerPlugin(ScrollTriggerRef);
  gsapRef.defaults({
    duration: 0.8,
    ease: "power2.out"
  });

  const media = gsapRef.matchMedia();

  media.add(
    {
      isDesktop: "(min-width: 961px)",
      isMobile: "(max-width: 960px)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    function (context) {
      const conditions = context.conditions;
      const isDesktop = Boolean(conditions && conditions.isDesktop);
      const reduceMotion = Boolean(conditions && conditions.reduceMotion);

      initCounters(gsapRef, ScrollTriggerRef, reduceMotion);
      initHeroEntrance(gsapRef, reduceMotion);
      initRevealBatches(gsapRef, ScrollTriggerRef, reduceMotion);
      initHeroScroll(gsapRef, ScrollTriggerRef, reduceMotion);
      initJourney(gsapRef, ScrollTriggerRef, isDesktop, reduceMotion);

      return function () {
        setJourneyStage(currentJourneyStage, { animate: false });
      };
    }
  );
})();
