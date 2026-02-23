import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const STORAGE_KEY = 'orbit-project-theme';

export function useProjectTheme() {
    const [isLight, setIsLight] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'light';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark');
        } catch { /* noop */ }
    }, [isLight]);

    const toggle = () => setIsLight(prev => !prev);
    const themeClass = isLight ? 'project-light' : '';

    return { isLight, toggle, themeClass };
}

export function ProjectThemeToggle({ isLight, toggle }: { isLight: boolean; toggle: () => void }) {
    return (
        <button
            onClick={toggle}
            className={`fixed bottom-6 left-6 z-50 p-3 rounded-full backdrop-blur-xl border transition-all duration-500 group ${isLight
                ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white shadow-lg shadow-gray-200/50'
                : 'bg-white/[0.05] border-white/[0.1] text-white/80 hover:bg-white/[0.1] hover:border-neon-purple/40 shadow-[0_0_15px_rgba(108,92,231,0.15)]'
                }`}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            <div className="relative w-5 h-5">
                <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${isLight ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} />
                <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${isLight ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
            </div>
        </button>
    );
}
