// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/app/**/*.{js,ts,jsx,tsx}",
//     "./src/modules/**/*.{js,ts,jsx,tsx}", 
//   ],
//   theme: {
//     extend: {
//       colors: {
//         dark: "#0D1B2A",
//         primary: "#1B263B",
//         secondary: "#415A77",
//         accent: "#778DA9",
//         light: "#E0E1DD",
//       },
//     },
//   },
//   plugins: [],
// };


// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   darkMode: 'class', // Enable dark mode with 'dark' class
//   content: [
//     "./src/app/**/*.{js,ts,jsx,tsx}", // Next.js App Router or similar
//     "./src/modules/**/*.{js,ts,jsx,tsx}", // Your modules folder
//     "./src/components/**/*.{js,ts,jsx,tsx}", // Add if you have a components folder
//     "./src/pages/**/*.{js,ts,jsx,tsx}", // Add if using Next.js Pages Router
//   ],
//   theme: {
//     extend: {
//       colors: {
//         dark: "#0D1B2A",
//         primary: "#1B263B",
//         secondary: "#415A77",
//         accent: "#778DA9",
//         light: "#E0E1DD",
//         background: "#E0E1DD",
//         foreground: "#0D1B2A",
//         card: "#FFFFFF", // Define card background
//         "card-foreground": "#0D1B2A", // Define card text
//         popover: "#FFFFFF", // Define popover background
//         "popover-foreground": "#0D1B2A", // Define popover text
//         sidebar: "#F7F7F7", // Define sidebar background
//         "sidebar-foreground": "#0D1B2A", // Define sidebar text
//       },
//     },
//   },
//   plugins: [], // Add tw-animate-css plugin here if needed
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
