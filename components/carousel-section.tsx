"use client"

import { ChevronLeft, ChevronRight, Zap, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function CarouselSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg mb-6">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">The Experience</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
            Immerse Yourself in Luxury
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Step into our world of elegance and discover why our clients call it their sanctuary of beauty.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-3xl shadow-2xl border border-white/10">
            <div className="flex transition-transform duration-500 ease-in-out" id="carousel-container">
              {/* Slide 1 - Redesigned */}
              <div className="min-w-full relative">
                <div className="relative h-[500px] md:h-[600px]">
                  <Image
                    src="/9587540.png?height=600&width=800"
                    alt="Luxury nail salon experience"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Where Beauty Meets Artistry
                    </h3>
                    <p className="text-lg md:text-xl text-slate-200 mb-6 max-w-2xl">
                      Our skilled nail artists bring years of experience and creativity to every appointment, ensuring
                      your nails become a masterpiece of design and precision.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Premium Products</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Expert Artists</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2 - Redesigned */}
              <div className="min-w-full relative">
                <div className="relative h-[500px] md:h-[600px]">
                  <Image
                    src="/9587518.png?height=600&width=800"
                    alt="Relaxing salon atmosphere"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Serene & Relaxing Atmosphere
                    </h3>
                    <p className="text-lg md:text-xl text-slate-200 mb-6 max-w-2xl">
                      Escape the hustle and bustle in our tranquil studio designed for ultimate relaxation and pampering.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Peaceful Environment</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Premium Comfort</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 - Redesigned */}
              <div className="min-w-full relative">
                <div className="relative h-[500px] md:h-[600px]">
                  <Image
                    src="/9587542.jpg?height=600&width=800"
                    alt="Beautiful nail designs"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Stunning Nail Artistry
                    </h3>
                    <p className="text-lg md:text-xl text-slate-200 mb-6 max-w-2xl">
                      From classic elegance to bold creativity, our artists bring your vision to life with precision and style.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Custom Designs</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Latest Trends</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Navigation Arrows */}
          <button
            onClick={() => {
              const container = document.getElementById('carousel-container');
              if (container) container.style.transform = 'translateX(-100%)';
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/40"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              const container = document.getElementById('carousel-container');
              if (container) container.style.transform = 'translateX(-200%)';
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/40"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
