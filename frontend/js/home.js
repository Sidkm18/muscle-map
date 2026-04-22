(function () {
  const body = document.body;

  if (!body || !body.classList.contains("landing-page")) {
    return;
  }

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const hasGsap = Boolean(gsap);
  const hasScrollTrigger = Boolean(gsap && ScrollTrigger);
  const hero = document.querySelector("#landing-hero");
  const heroBadge = document.querySelector("[data-hero-badge]");
  const heroBrand = document.querySelector("[data-hero-brand]");
  const heroTitleLines = Array.from(document.querySelectorAll(".landing-title-line"));
  const heroCopy = document.querySelector("[data-hero-copy]");
  const heroActions = document.querySelector("[data-hero-actions]");
  const heroPoints = Array.from(document.querySelectorAll(".landing-points li"));
  const heroChips = Array.from(document.querySelectorAll("[data-hero-chip]"));
  const heroDevice = document.querySelector("[data-hero-device]");
  const heroPhoneShell = document.querySelector(".hero-phone-shell");
  const heroGlows = Array.from(document.querySelectorAll(".landing-hero-glow"));
  const heroMockRows = Array.from(document.querySelectorAll(".mock-list-item"));
  const heroFooterCards = Array.from(document.querySelectorAll(".mock-hero-footer > div"));
  const homeRevealItems = Array.from(document.querySelectorAll("[data-home-reveal]"));
  const tiltCards = Array.from(document.querySelectorAll(".proof-item, .tool-panel"));
  const storyDayButtons = Array.from(document.querySelectorAll("[data-story-day]"));
  const storyTagButtons = Array.from(document.querySelectorAll("[data-story-tag]"));
  const storyMovementTitle = document.querySelector("[data-story-movement-title]");
  const storyStatValues = Array.from(document.querySelectorAll("[data-story-stat-value]"));
  const journeySteps = Array.from(document.querySelectorAll("[data-journey-step]"));
  const journeyStates = Array.from(document.querySelectorAll("[data-journey-state]"));
  const journeyDots = Array.from(document.querySelectorAll("[data-journey-dot]"));
  const journeyScroller = document.querySelector("[data-journey-scroller]");
  let currentJourneyStage = -1;
  const storyDayMap = {
    mon: {
      movement: "Bench press",
      tags: ["Compound", "Chest", "Intermediate"],
      stats: ["4 x 8", "Strength volume", "Dumbbell press"]
    },
    tue: {
      movement: "Hanging knee raise",
      tags: ["Core", "Stability", "Bodyweight"],
      stats: ["3 x 12", "Bracing control", "Dead bug hold"]
    },
    thu: {
      movement: "Back squat",
      tags: ["Compound", "Legs", "Intermediate"],
      stats: ["5 x 5", "Power output", "Goblet squat"]
    },
    sat: {
      movement: "Bike intervals",
      tags: ["Conditioning", "Cardio", "All levels"],
      stats: ["8 rounds", "Engine work", "Rower intervals"]
    }
  };

  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    body.classList.add("has-gsap");
  }

  function syncThemeState() {
    const computed = window.getComputedStyle(root);
    const primaryRgb = computed.getPropertyValue("--primary-rgb").trim();

    if (primaryRgb) {
      body.style.setProperty("--home-primary-rgb-live", primaryRgb);
    }
  }

  function toggleJourneyClasses(index) {
    journeySteps.forEach(function (step, stepIndex) {
      step.classList.toggle("is-active", stepIndex === index);
      step.setAttribute("aria-pressed", stepIndex === index ? "true" : "false");
    });

    journeyDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
      dot.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
    });
  }

  function animateJourneyStage(index) {
    if (!hasGsap || prefersReducedMotion) {
      return;
    }

    const state = journeyStates[index];
    const step = journeySteps[index];
    const dot = journeyDots[index];
    const statePieces = state
      ? Array.from(state.querySelectorAll(".journey-state-head, .journey-state-surface article, .journey-log-grid > div, .journey-log-note, .journey-review-top, .journey-review-stats article"))
      : [];
    const logBar = state ? state.querySelector(".journey-log-bar span") : null;
    const reviewRing = state ? state.querySelector(".journey-review-ring") : null;

    if (step) {
      gsap.fromTo(step, {
        scale: 0.985
      }, {
        scale: 1,
        duration: 0.36,
        ease: "power2.out",
        overwrite: "auto",
        clearProps: "transform"
      });
    }

    if (dot) {
      gsap.fromTo(dot, {
        scale: 0.82
      }, {
        scale: 1.18,
        duration: 0.32,
        ease: "back.out(1.7)",
        overwrite: "auto"
      });
    }

    if (statePieces.length) {
      gsap.fromTo(statePieces, {
        y: 16,
        autoAlpha: 0
      }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.48,
        stagger: 0.06,
        ease: "power2.out",
        overwrite: "auto",
        clearProps: "transform,opacity,visibility"
      });
    }

    if (logBar) {
      gsap.fromTo(logBar, {
        scaleX: 0.24,
        transformOrigin: "left center"
      }, {
        scaleX: 1,
        duration: 0.78,
        ease: "power3.out",
        overwrite: "auto"
      });
    }

    if (reviewRing) {
      gsap.fromTo(reviewRing, {
        scale: 0.9,
        rotation: -10
      }, {
        scale: 1,
        rotation: 0,
        duration: 0.78,
        ease: "back.out(1.4)",
        overwrite: "auto",
        clearProps: "transform"
      });
    }
  }

  function setJourneyStage(index) {
    if (!journeyStates.length || index < 0 || index >= journeyStates.length) {
      return;
    }

    const hasChanged = currentJourneyStage !== index;
    currentJourneyStage = index;
    toggleJourneyClasses(index);

    journeyStates.forEach(function (state, stateIndex) {
      state.classList.toggle("is-active", stateIndex === index);
    });

    if (hasChanged) {
      animateJourneyStage(index);
    }
  }

  function scrollJourneyTo(index) {
    const target = journeyStates[index];

    if (!journeyScroller || !target) {
      setJourneyStage(index);
      return;
    }

    setJourneyStage(index);
    journeyScroller.scrollTo({
      top: target.offsetTop,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }

  function formatCounter(value, decimals, suffix) {
    if (decimals > 0) {
      return value.toFixed(decimals) + suffix;
    }

    return Math.round(value).toString() + suffix;
  }

  function setActiveStoryTag(index) {
    storyTagButtons.forEach(function (button, buttonIndex) {
      const isActive = buttonIndex === index;
      button.classList.toggle("active", isActive);
    });
  }

  function animateStoryDayChange(activeButton) {
    if (!hasGsap || prefersReducedMotion) {
      return;
    }

    if (activeButton) {
      gsap.fromTo(activeButton, {
        scale: 0.985,
        y: 0
      }, {
        scale: 1.01,
        y: -3,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
        overwrite: "auto",
        clearProps: "transform"
      });
    }

    if (storyMovementTitle) {
      gsap.fromTo(storyMovementTitle, {
        y: 10,
        autoAlpha: 0.45
      }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.34,
        ease: "power2.out",
        overwrite: "auto",
        clearProps: "transform,opacity,visibility"
      });
    }

    if (storyTagButtons.length) {
      gsap.fromTo(storyTagButtons, {
        y: 8,
        autoAlpha: 0.4
      }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.28,
        stagger: 0.04,
        ease: "power2.out",
        overwrite: "auto",
        clearProps: "transform,opacity,visibility"
      });
    }

    if (storyStatValues.length) {
      gsap.fromTo(storyStatValues, {
        y: 10,
        autoAlpha: 0.4
      }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        overwrite: "auto",
        clearProps: "transform,opacity,visibility"
      });
    }
  }

  function setStoryDay(dayKey, options) {
    const story = storyDayMap[dayKey];
    const shouldAnimate = !(options && options.animate === false);
    let activeButton = null;

    if (!story || !storyMovementTitle || storyStatValues.length < 3) {
      return;
    }

    storyDayButtons.forEach(function (button) {
      const isActive = button.getAttribute("data-story-day") === dayKey;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");

      if (isActive) {
        activeButton = button;
      }
    });

    storyMovementTitle.textContent = story.movement;

    storyTagButtons.forEach(function (button, index) {
      if (story.tags[index]) {
        button.textContent = story.tags[index];
      }
    });

    story.stats.forEach(function (value, index) {
      if (storyStatValues[index]) {
        storyStatValues[index].textContent = value;
      }
    });

    setActiveStoryTag(0);

    if (shouldAnimate) {
      animateStoryDayChange(activeButton);
    }
  }

  function initStoryPanel() {
    if (!storyDayButtons.length || !storyTagButtons.length) {
      return;
    }

    setStoryDay(storyDayButtons[0].getAttribute("data-story-day") || "mon", {
      animate: false
    });

    storyDayButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setStoryDay(button.getAttribute("data-story-day") || "mon", {
          animate: true
        });
      });
    });

  }

  function animateCounter(element, target, decimals, suffix) {
    if (element.getAttribute("data-counter-animated") === "true") {
      return;
    }

    element.setAttribute("data-counter-animated", "true");

    if (prefersReducedMotion) {
      element.textContent = formatCounter(target, decimals, suffix);
      return;
    }

    if (hasGsap) {
      const counterState = {
        value: 0
      };

      gsap.to(counterState, {
        value: target,
        duration: 1.15,
        ease: "power2.out",
        onUpdate: function () {
          element.textContent = formatCounter(counterState.value, decimals, suffix);
        },
        onComplete: function () {
          element.textContent = formatCounter(target, decimals, suffix);
        }
      });
      return;
    }

    const duration = 900;
    const startTime = window.performance.now();

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      element.textContent = formatCounter(value, decimals, suffix);

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      }
    }

    window.requestAnimationFrame(frame);
  }

  function initCounters() {
    const counters = Array.from(document.querySelectorAll("[data-counter-to]"));

    if (!counters.length) {
      return;
    }

    if (hasScrollTrigger && !prefersReducedMotion) {
      counters.forEach(function (element) {
        const target = Number(element.getAttribute("data-counter-to") || "0");
        const decimals = Number(element.getAttribute("data-counter-decimals") || "0");
        const suffix = element.getAttribute("data-counter-suffix") || "";

        ScrollTrigger.create({
          trigger: element,
          start: "top 84%",
          once: true,
          onEnter: function () {
            animateCounter(element, target, decimals, suffix);
          }
        });
      });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (element) {
        const target = Number(element.getAttribute("data-counter-to") || "0");
        const decimals = Number(element.getAttribute("data-counter-decimals") || "0");
        const suffix = element.getAttribute("data-counter-suffix") || "";
        animateCounter(element, target, decimals, suffix);
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;
        const target = Number(element.getAttribute("data-counter-to") || "0");
        const decimals = Number(element.getAttribute("data-counter-decimals") || "0");
        const suffix = element.getAttribute("data-counter-suffix") || "";

        animateCounter(element, target, decimals, suffix);
        observer.unobserve(element);
      });
    }, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.2
    });

    counters.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initJourney() {
    if (!journeyScroller || !journeySteps.length || !journeyStates.length) {
      return;
    }

    setJourneyStage(0);
    journeyScroller.scrollTop = 0;

    journeySteps.forEach(function (step) {
      step.addEventListener("click", function () {
        const index = Number(step.getAttribute("data-journey-step") || "0");
        scrollJourneyTo(index);
      });
    });

    journeyDots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const index = Number(dot.getAttribute("data-journey-dot") || "0");
        scrollJourneyTo(index);
      });
    });

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        const index = Number(entry.target.getAttribute("data-journey-state") || "0");
        setJourneyStage(index);
      });
    }, {
      root: journeyScroller,
      threshold: 0.6
    });

    journeyStates.forEach(function (state) {
      observer.observe(state);
    });
  }

  function initHeroMotion() {
    if (!hasGsap || prefersReducedMotion || !hero) {
      return;
    }

    const introTimeline = gsap.timeline({
      defaults: {
        duration: 0.82,
        ease: "power3.out"
      }
    });

    if (heroDevice) {
      gsap.set(heroDevice, {
        transformPerspective: 1200,
        transformOrigin: "center center"
      });
    }

    introTimeline
      .from([heroBadge, heroBrand], {
        y: 22,
        autoAlpha: 0,
        stagger: 0.08
      })
      .from(heroTitleLines, {
        y: 68,
        autoAlpha: 0,
        stagger: 0.1
      }, "-=0.45")
      .from(heroCopy, {
        y: 24,
        autoAlpha: 0
      }, "-=0.46")
      .from(heroActions, {
        y: 22,
        autoAlpha: 0
      }, "-=0.48")
      .from(heroPoints, {
        y: 18,
        autoAlpha: 0,
        stagger: 0.06
      }, "-=0.5")
      .from(heroDevice, {
        y: 32,
        scale: 0.94,
        rotation: -5,
        autoAlpha: 0,
        duration: 1
      }, 0.16)
      .from(heroChips, {
        y: 18,
        x: function (index) {
          return index === 1 ? 20 : -18;
        },
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.72
      }, 0.48)
      .from(heroMockRows, {
        x: 22,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.54
      }, 0.66)
      .from(heroFooterCards, {
        y: 18,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.48
      }, 0.88);
  }

  function initAmbientHeroMotion() {
    if (!hasGsap || prefersReducedMotion) {
      return;
    }

    heroChips.forEach(function (chip, index) {
      gsap.to(chip, {
        x: index === 1 ? -10 : 8,
        y: index === 2 ? 12 : -10,
        rotation: index === 1 ? -1.5 : 1.25,
        duration: 4.4 + (index * 0.65),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });

    heroGlows.forEach(function (glow, index) {
      gsap.to(glow, {
        x: index === 0 ? -20 : 18,
        y: index === 0 ? 14 : -16,
        scale: index === 0 ? 1.08 : 0.94,
        duration: 7 + (index * 1.4),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });

    if (heroPhoneShell) {
      gsap.to(heroPhoneShell, {
        y: -10,
        duration: 3.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    }

    if (hasScrollTrigger && heroPhoneShell) {
      gsap.to(heroPhoneShell, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.1
        }
      });
    }
  }

  function initScrollRevealMotion() {
    const journeyDevice = document.querySelector("[data-journey-device]");

    if (!hasScrollTrigger || prefersReducedMotion || !homeRevealItems.length) {
      return;
    }

    gsap.set(homeRevealItems, {
      y: 34,
      autoAlpha: 0
    });

    ScrollTrigger.batch(homeRevealItems, {
      start: "top 84%",
      once: true,
      onEnter: function (elements) {
        gsap.to(elements, {
          y: 0,
          autoAlpha: 1,
          duration: 0.76,
          stagger: 0.12,
          ease: "power3.out",
          overwrite: "auto",
          clearProps: "transform,opacity,visibility"
        });
      }
    });

    if (journeyDevice) {
      gsap.from(journeyDevice, {
        y: 28,
        scale: 0.97,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#home-journey",
          start: "top 72%",
          once: true
        }
      });
    }
  }

  function initHeroTilt() {
    const heroVisual = document.querySelector(".landing-visual");
    let rotateXTo;
    let rotateYTo;
    let xTo;
    let yTo;

    if (!hasGsap || prefersReducedMotion || !canHover || !heroVisual || !heroDevice) {
      return;
    }

    rotateXTo = gsap.quickTo(heroDevice, "rotationX", {
      duration: 0.45,
      ease: "power3.out"
    });
    rotateYTo = gsap.quickTo(heroDevice, "rotationY", {
      duration: 0.45,
      ease: "power3.out"
    });
    xTo = gsap.quickTo(heroDevice, "x", {
      duration: 0.45,
      ease: "power3.out"
    });
    yTo = gsap.quickTo(heroDevice, "y", {
      duration: 0.45,
      ease: "power3.out"
    });

    heroVisual.addEventListener("pointermove", function (event) {
      const bounds = heroVisual.getBoundingClientRect();
      const relativeX = ((event.clientX - bounds.left) / bounds.width) - 0.5;
      const relativeY = ((event.clientY - bounds.top) / bounds.height) - 0.5;

      rotateXTo(relativeY * -10);
      rotateYTo(relativeX * 14);
      xTo(relativeX * 10);
      yTo(relativeY * -10);
    });

    heroVisual.addEventListener("pointerleave", function () {
      rotateXTo(0);
      rotateYTo(0);
      xTo(0);
      yTo(0);
    });
  }

  function initTiltCards() {
    if (!hasGsap || prefersReducedMotion || !canHover || !tiltCards.length) {
      return;
    }

    tiltCards.forEach(function (card) {
      const rotateXTo = gsap.quickTo(card, "rotationX", {
        duration: 0.32,
        ease: "power3.out"
      });
      const rotateYTo = gsap.quickTo(card, "rotationY", {
        duration: 0.32,
        ease: "power3.out"
      });
      const yTo = gsap.quickTo(card, "y", {
        duration: 0.32,
        ease: "power3.out"
      });
      const scaleTo = gsap.quickTo(card, "scale", {
        duration: 0.32,
        ease: "power3.out"
      });

      gsap.set(card, {
        transformPerspective: 900,
        transformOrigin: "center center"
      });

      card.addEventListener("pointerenter", function () {
        yTo(-6);
        scaleTo(1.01);
      });

      card.addEventListener("pointermove", function (event) {
        const bounds = card.getBoundingClientRect();
        const relativeX = ((event.clientX - bounds.left) / bounds.width) - 0.5;
        const relativeY = ((event.clientY - bounds.top) / bounds.height) - 0.5;

        rotateXTo(relativeY * -8);
        rotateYTo(relativeX * 10);
      });

      card.addEventListener("pointerleave", function () {
        rotateXTo(0);
        rotateYTo(0);
        yTo(0);
        scaleTo(1);
      });
    });
  }

  function initGsapEnhancements() {
    if (!hasGsap || prefersReducedMotion) {
      return;
    }

    initHeroMotion();
    initAmbientHeroMotion();
    initScrollRevealMotion();
    initHeroTilt();
    initTiltCards();

    if (hasScrollTrigger) {
      window.addEventListener("load", function () {
        ScrollTrigger.refresh();
      }, {
        once: true
      });
    }
  }

  syncThemeState();
  document.addEventListener("mm:themechange", syncThemeState);

  initStoryPanel();
  initJourney();
  initCounters();
  initGsapEnhancements();
})();
