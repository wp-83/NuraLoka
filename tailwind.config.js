/** @type {import('tailwindcss').Config} */

module.exports = {
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#5A3812",
                    100: "#5A3812",
                    85: "#724633",
                    70: "#8A6654",
                    50: "#AB907F",
                    30: "#D5B9AA",
                    10: "#FFF0E8",
                },

                secondary: {
                    DEFAULT: "#1B5E20",
                    100: "#1B5E20",
                    85: "#3E7A42",
                    70: "#629764",
                    50: "#8DBE90",
                    30: "#B8E0BC",
                    10: "#E8F6E9",
                },

                accent: {
                    DEFAULT: "#239A90",
                    100: "#239A90",
                    85: "#3FAB9F",
                    70: "#5BBCAF",
                    50: "#8FD3CB",
                    30: "#C3E9E7",
                    10: "#E9F7F6",
                },

                gray: {
                    DEFAULT: "#000000",
                    100: "#000000",
                    85: "#262626",
                    70: "#4D4D4D",
                    50: "#808080",
                    30: "#B3B3B3",
                    10: "#F7F7F7",
                },

                success: {
                    dark: "#008D0D",
                    DEFAULT: "#3EC147",
                    light: "#EDFEEE",
                },

                warning: {
                    dark: "#BEB100",
                    DEFAULT: "#E8DD3B",
                    light: "#FFFDE0",
                },

                error: {
                    dark: "#C3080B",
                    DEFAULT: "#FB5050",
                    light: "#FFE4E4",
                },

                info: {
                    dark: "#004EA7",
                    DEFAULT: "#1B86FF",
                    light: "#ECF3FF",
                },

                white: "#FFFFFF",
            },

            fontFamily: {
                heading: ["Poppins", "sans-serif"],
                body: ["Carlito", "sans-serif"],
            },

            fontSize: {
                hero: ["3rem", { lineHeight: "1.2" }],
                title: ["2.25rem", { lineHeight: "1.25" }],
                subtitle: ["1.75rem", { lineHeight: "1.3" }],
                paragraph: ["1.125rem", { lineHeight: "1.75" }],
                body: ["1rem", { lineHeight: "1.6" }],
                small: ["0.875rem", { lineHeight: "1.5" }],
                micro: ["0.75rem", { lineHeight: "1.4" }],

                "btn-lg": ["1.5rem", { lineHeight: "1.2" }],
                "btn-md": ["1.125rem", { lineHeight: "1.2" }],
                "btn-sm": ["1rem", { lineHeight: "1.2" }], 
            },
        },
    },

    plugins: [],
};
