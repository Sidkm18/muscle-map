particlesJS("particles-js", {
    particles: {
        number: { value: 90, density: { enable: true, value_area: 800 } },
        color: { value: "#00e5ff" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#00e5ff",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 1.5
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" }
        },
        modes: {
            repulse: { distance: 120 },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true
});