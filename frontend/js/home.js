(function () {
  const body = document.body;

  if (!body || !body.classList.contains("landing-page")) {
    return;
  }

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const storyDayButtons = Array.from(document.querySelectorAll("[data-story-day]"));
  const storyTagButtons = Array.from(document.querySelectorAll("[data-story-tag]"));
  const storyMovementTitle = document.querySelector("[data-story-movement-title]");
  const storyStatValues = Array.from(document.querySelectorAll("[data-story-stat-value]"));
  const journeySteps = Array.from(document.querySelectorAll("[data-journey-step]"));
  const journeyStates = Array.from(document.querySelectorAll("[data-journey-state]"));
  const journeyDots = Array.from(document.querySelectorAll("[data-journey-dot]"));
  const journeyScroller = document.querySelector("[data-journey-scroller]");
  let currentJourneyStage = 0;
  const storyDayMap = {
    mon: {
      movement: "Bench press",
      tags: ["Compound", "Chest", "Intermediate"],
      stats: ["4 x 8", "Strength volume", "Dumbbell press"]
    },
    tue: {
      movement: "Dead bug circuit",
      tags: ["Core", "Recovery", "Beginner"],
      stats: ["3 rounds", "Stability and steps", "Cable crunch"]
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

  function setJourneyStage(index) {
    if (!journeyStates.length || index < 0 || index >= journeyStates.length) {
      return;
    }

    currentJourneyStage = index;
    toggleJourneyClasses(index);

    journeyStates.forEach(function (state, stateIndex) {
      state.classList.toggle("is-active", stateIndex === index);
    });
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
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setStoryDay(dayKey) {
    const story = storyDayMap[dayKey];

    if (!story || !storyMovementTitle || storyStatValues.length < 3) {
      return;
    }

    storyDayButtons.forEach(function (button) {
      const isActive = button.getAttribute("data-story-day") === dayKey;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
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
  }

  function initStoryPanel() {
    if (!storyDayButtons.length || !storyTagButtons.length) {
      return;
    }

    storyDayButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setStoryDay(button.getAttribute("data-story-day") || "mon");
      });
    });

    storyTagButtons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        setActiveStoryTag(index);
      });
    });
  }

  function animateCounter(element, target, decimals, suffix) {
    if (prefersReducedMotion) {
      element.textContent = formatCounter(target, decimals, suffix);
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

  syncThemeState();
  document.addEventListener("mm:themechange", syncThemeState);

  initStoryPanel();
  initCounters();
  initJourney();
})();
