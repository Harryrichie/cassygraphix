import React from 'react'
import BizCard from './BizCard'
import LogoBiz from '../assets/icon-logo.png'
function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Have a project in mind?</h2>
          <p className="text-slate-400 mb-10 text-lg">
            I'm currently accepting new projects. Let's collaborate to build something great.
          </p>
          <BizCard/>
          <a href="mailto:cassygraphix@gmail.com" 
          target="_blank" rel="noopener noreferrer"
          className="inline-block bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-indigo-50 transition-colors my-10">
            Get in Touch
          </a>
          <div className="mt-20 pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <div className="my-4 md:my-0">
              <img src={LogoBiz} alt="logo" className="w-20 opacity-100 " />
            </div>
            <p><i className="fa-regular fa-copyright"></i> {new Date().getFullYear()} Cassy Graphix. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://x.com/Cassy_6255?t=xj6k5q8sMtzJ71KF2LognA&s=09" 
              target="_blank" rel="noopener noreferrer"className="hover:text-white transition-colors">Twitter</a>
              <a href="https://www.instagram.com/cassy_graphix?igsh=MXdyNzZnb2doa3c4dg==" 
              target="_blank" rel="noopener noreferrer"className="hover:text-white transition-colors">Instagram</a>
              <a href="#Linkedin" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
  )
}

export default Footer
