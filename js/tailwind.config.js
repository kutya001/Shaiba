tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#2463eb",
                "background-light": "#f8fafc",
                "background-dark": "#111621",
                "surface": "#ffffff",
                "text-main": "#0f172a",
                "muted": "#64748b",
                "border-subtle": "#e2e8f0",
                "status-open-bg": "#FEF3C7",
                "status-open-text": "#D97706",
                "status-completed-bg": "#D1FAE5",
                "status-completed-text": "#059669",
                "status-canceled-bg": "#FEE2E2",
                "status-canceled-text": "#DC2626"
            },
            fontFamily: {
                "sans": ["Plus Jakarta Sans", "sans-serif"],
                "heading": ["Space Grotesk", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem", // 16px for cards
                "xl": "1.5rem",
                "full": "9999px"
            },
            boxShadow: {
                "soft": "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
                "header": "0 2px 10px rgba(15, 23, 42, 0.03)",
                "fab": "0 8px 24px -4px rgba(36, 99, 235, 0.4)"
            }
        }
    }
}
