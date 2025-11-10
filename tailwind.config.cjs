/**
 * Tailwind CSS v4 Configuration
 *
 * Note: In Tailwind CSS v4, configuration is now CSS-first.
 * This file is kept for backward compatibility but is not actively used.
 * All configuration is now done in src/tailwind.css using @theme and @plugin directives.
 *
 * See: https://tailwindcss.com/docs/upgrade-guide
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    // Note: In v4, plugins are imported in CSS using @plugin directive
    // See src/tailwind.css for the actual plugin configuration
    require('@tailwindcss/forms'),
  ],
}
