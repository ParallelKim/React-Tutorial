import colors from "tailwindcss/colors";

export const content = ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"];
export const theme = {
  extend: {
    colors: {
      ...colors,
    },
  },
};
export const variants = {
  extend: {},
};
export const plugins = [];
