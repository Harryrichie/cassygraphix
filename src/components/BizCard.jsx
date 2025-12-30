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
    <div className="bg-slate-100 flex justify-center items-center min-h-[400px] p-6 rounded-2xl shadow-2xl transition-transform duration-700 ease-in-out hover:scale-105">
      {/* 3D container for the card flip effect */}
      <div className="w-96 h-56 [perspective:1000px] group cursor-pointer">
        {/* The card that will flip */}
        <div className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          {/* Front of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] rounded-2xl shadow-2xl overflow-hidden">
            <img src={FrontCard} alt="Front of the business card" className="w-full h-full object-cover" />
          </div>
          {/* Back of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-2xl overflow-hidden">
            <img src={BackCard} alt="Back of the business card" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BizCard
