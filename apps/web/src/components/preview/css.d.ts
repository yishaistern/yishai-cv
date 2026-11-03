// Lets TypeScript accept `import './cv.css'`. Vite does the real CSS handling.
// (Not needed if the project adds `/// <reference types="vite/client" />`; harmless if it does.)
declare module '*.css';
