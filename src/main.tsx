import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Aggressive console and DevTools lock
const lockDevTools = () => {
    // 1. Override console methods
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'dir', 'dirxml', 'table', 'trace', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset', 'assert', 'profile', 'profileEnd', 'time', 'timeLog', 'timeEnd', 'timeStamp', 'context', 'memory'];
    methods.forEach(method => {
        (console as any)[method] = () => { };
    });

    // 2. Prevent right-click and common keyboard shortcuts for DevTools
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U') ||
            (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.metaKey && e.key === 'U')
        ) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Constant debugger loop
    // This freezes the browser if DevTools is actually open, preventing inspection
    setInterval(() => {
        (function () {
            return false;
        }
        ['constructor']('debugger')
        ['call']());
    }, 50);

    // 4. Overwrite console to prevent restoration
    Object.defineProperty(window, 'console', {
        value: console,
        writable: false,
        configurable: false
    });
};

(window as any).__unlockConsole = () => {
    // Cannot easily unlock the aggressive version without a page reload 
    // because we disabled context menus and froze properties
    alert("Unlock command received. Please remove the lock code and refresh.");
};

lockDevTools();


createRoot(document.getElementById("root")!).render(<App />);
