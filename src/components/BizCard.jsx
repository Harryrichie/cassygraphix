import React, { useState, useEffect } from 'react'
import FrontCard from '../assets/biz-card.jpg'
import BackCard from '../assets/biz-card-b.jpg'

function BizCard() {
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped((prev) => !prev)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 flex justify-center items-center min-h-[250px] md:min-h-[400px] p-2 md:p-12 rounded-3xl shadow-2xl transition-all duration-700 ease-in-out hover:scale-105 overflow-hidden">
      {/* 3D container for the card flip effect */}
      <div className="w-full max-w-[350px] md:w-[480px] aspect-[1.75/1] [perspective:2000px] group cursor-pointer">
        {/* The card that will flip */}
        <div className={`relative w-full h-full transition-transform duration-1000 ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          {/* Front of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
            <img src={FrontCard} alt="Front of the business card" className="w-full h-full object-contain" />
          </div>
          {/* Back of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
            <img src={BackCard} alt="Back of the business card" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BizCard
