// reset state
gsap.set(".mask", {
    opacity: 0,
    y: 60,
    scale: 0.9
});

const tl = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.8
});

// ENTRANCE — strong & hype
tl.to(".mask", {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    stagger: 0.12,
    ease: "back.out(1.7)"
});

// PUNCH (gym emphasis)
tl.to(".mask", {
    scale: 1.12,
    duration: 0.15,
    stagger: 0.18,
    ease: "power2.out"
}, "+=0.3");

tl.to(".mask", {
    scale: 1,
    duration: 0.2,
    stagger: 0.18,
    ease: "power2.inOut"
});

// EXIT — fast reset
tl.to(".mask", {
    opacity: 0,
    y: -50,
    duration: 0.45,
    stagger: 0.1,
    ease: "power2.in"
}, "+=1");