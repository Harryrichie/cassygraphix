import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Initialize state from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update the document class and localStorage whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-50 border border-slate-200/60 dark:border-slate-800/60 rounded-full shadow-xl transition-all duration-300">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight dark:text-white">CASSY<span className="text-indigo-600">GRAPHIX</span></div>
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <Link to="/"  className="text-slate-600 dark:text-slate-300 font-medium hover:text-indigo-600 transition-colors">Home</Link>
            <a href="#work" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">Work</a>
            <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">Services</a>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <a href="https://wa.link/zsbu0e" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-slate-900 text-white text-xs font-medium rounded-full hover:bg-slate-800 transition-colors hidden md:block">
              Hire Me
            </a>
            <button 
              className='md:hidden cursor-pointer text-slate-600 hover:text-indigo-600 transition-colors w-10 h-10 flex items-center justify-center'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-x' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col p-6 space-y-4 text-center">
              <Link to="/"  className="text-slate-600 dark:text-slate-300 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <a href="#work" className="text-slate-600 dark:text-slate-300 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Work</a>
              <a href="#services" className="text-slate-600 dark:text-slate-300 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
              <a href="https://wa.link/zsbu0e" target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-slate-900 text-white text-center font-medium rounded-full hover:bg-slate-800 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Hire Me
              </a>
            </div>
          </div>
        )}
      </nav>
  )
}

export default NavBar
