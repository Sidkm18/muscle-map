tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#a3e635",
                "background-light": "#F3F4F6",
                "background-dark": "#0A0A0A",
                "surface-dark": "#121212",
                "surface-light": "#FFFFFF",
            },
            fontFamily: {
                display: ["Anton", "sans-serif"],
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
            },
            backgroundImage: {
                "gym-hero":
                    "linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop')",
                "gym-about":
                    "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')",
            },
        },
    },
};
