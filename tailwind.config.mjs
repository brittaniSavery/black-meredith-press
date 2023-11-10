/** @type {import('tailwindcss').Config} */

import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Darker Grotesque Variable",
          "Darker Grotesque",
          ...defaultTheme.fontFamily.sans,
        ],
        serif: ["Cormorant SC", ...defaultTheme.fontFamily.serif],
      },
      spacing: {
        "quarter-screen": "25vh",
        "half-screen": "50vh",
        screen: "100vh",
      },
      typography: {
        xl: {
          css: {
            lineHeight: defaultTheme.fontSize.xl[1].lineHeight,
          },
        },
        "2xl": {
          css: {
            lineHeight: defaultTheme.fontSize["2xl"][1].lineHeight,
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
