tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#a3e635",
                "background-light": "#f8f8f5",
                "background-dark": "#09090b",
                "glass-border": "rgba(255, 255, 255, 0.08)",
                "glass-bg": "rgba(20, 20, 20, 0.6)",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"]
            },
            boxShadow: {
                'neon': '0 0 10px rgba(163, 230, 53, 0.2)',
                'neon-strong': '0 0 20px rgba(163, 230, 53, 0.35)',
                'error': '0 0 12px rgba(239, 68, 68, 0.3)',
            },
            animation: {
                fadeIn: 'fadeIn 0.6s ease-out'
            }
        },
    },
}
