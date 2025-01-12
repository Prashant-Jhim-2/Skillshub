/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        jump: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        jump: 'jump 0.5s ease-in-out infinite',
        slideDown: 'slideDown 0.30s ease-out',
        spinslow: 'spin 3s linear infinite',
        slide: 'slide 1.5s ease-in-out infinite',
      },
      boxShadow: {
        'custom': '7px 7px 0px gray',
         "button": "3px 3px 0px grey"
      },
     
        
      
      
    },
  },
  plugins: [],
};