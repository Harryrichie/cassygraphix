import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom';

function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">CASSY<span className="text-indigo-600">GRAPHIX</span></div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <Link to="/"  className="text-slate-600 font-medium hover:text-indigo-600 transition-colors">Home</Link>
            <a href="#work" className="hover:text-indigo-600 transition-colors">Work</a>
            <a href="#services" className="hover:text-indigo-600 transition-colors">Services</a>
            <Link to="/admin" className="hover:text-indigo-600 transition-colors"><i className='fa-solid fa-lock me-1 text-slate-gray-40'></i>Brand</Link>
          </div>
          <a href="https://wa.link/zsbu0e" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors hidden md:block">
            Hire Me
          </a>
          <button 
            className='md:hidden cursor-pointer text-slate-600 hover:text-indigo-600 transition-colors'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-x' : 'fa-bars'}`}></i>
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl">
            <div className="flex flex-col p-6 space-y-4">
              <Link to="/"  className="text-slate-600 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <a href="#work" className="text-slate-600 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Work</a>
              <a href="#services" className="text-slate-600 font-medium hover:text-indigo-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
              <Link to="/admin" className="hover:text-indigo-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}><i className='fa-solid fa-lock me-1 text-slate-gray-40'></i>Brand</Link>
              <a href="https://wa.link/zsbu0e" target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-slate-900 text-white text-center font-medium rounded-lg hover:bg-slate-800 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Hire Me
              </a>
            </div>
          </div>
        )}
      </nav>
  )
}

export default NavBar
