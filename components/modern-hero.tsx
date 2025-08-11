"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Sparkles, ArrowRight, CheckCircle, Zap, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Service } from "@/lib/supabase"

interface ModernHeroProps {
  services: Service[]
}

export default function ModernHero({ services }: ModernHeroProps) {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-rose-100/30 to-purple-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-32 right-32 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl transform rotate-45 animate-float opacity-60"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full animate-float-delayed opacity-60"></div>
        <div className="absolute top-1/3 left-20 w-12 h-12 bg-gradient-to-br from-rose-400 to-orange-400 rounded-lg transform -rotate-12 animate-float opacity-40"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Modern Badge */}
            <div className={`inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${isVisible ? 'animate-slide-up' : ''}`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">Premium Nail Care Experience</span>
            </div>

            {/* Hero Title with Modern Typography */}
            <div className="space-y-6">
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight ${isVisible ? 'animate-slide-up' : ''}`}>
                <span className="bg-gradient-to-r from-slate-900 via-purple-800 to-rose-800 bg-clip-text text-transparent">
                  Beautiful Nails,
                </span>
                <br />
                <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Beautiful You
                </span>
              </h1>
              <p className={`text-xl sm:text-2xl text-slate-600 leading-relaxed max-w-2xl ${isVisible ? 'animate-slide-up' : ''}`}>
                Experience Haymi nail care in our serene studio. From classic manicures to stunning nail art, we
                create beautiful nails that make you feel confident and radiant.
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isVisible ? 'animate-slide-up' : ''}`}>
              <Link href="/improved-booking">
                <Button className="btn-primary-modern group">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin transition-all duration-300" />
                  Book Your Appointment
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="#services">
                <Button variant="outline" className="btn-secondary-modern group">
                  <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Explore Services
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className={`flex items-center space-x-8 pt-6 ${isVisible ? 'animate-slide-up' : ''}`}>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 animate-bounce-gentle" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <span className="text-slate-600 font-medium">4.9/5 (200+ reviews)</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-slate-500">
                <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" />
                <span>Professional Artists</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className={`grid grid-cols-2 gap-4 pt-4 ${isVisible ? 'animate-slide-up' : ''}`}>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Premium Products</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-300"></div>
                <span>Hygiene First</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-500"></div>
                <span>Expert Artists</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse delay-700"></div>
                <span>Relaxing Environment</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative z-10">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                <Image
                  src="/hero.jpg?height=700&width=600"
                  alt="Luxury nail salon"
                  width={600}
                  height={700}
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                
                {/* Floating Action Button */}
                <div className="absolute top-6 right-6">
                  <Button size="sm" className="bg-white/90 text-purple-600 hover:bg-white shadow-lg backdrop-blur-sm">
                    <Zap className="w-4 h-4 mr-2" />
                    New System
                  </Button>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl shadow-xl transform rotate-12 animate-float"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl shadow-xl transform -rotate-12 animate-float-delayed"></div>
            </div>
            
            {/* Background Decorative Elements */}
            <div className="absolute -top-8 -right-8 w-full h-full bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-3xl -z-10 transform rotate-3"></div>
            <div className="absolute -bottom-8 -left-8 w-full h-full bg-gradient-to-br from-blue-200/50 to-indigo-200/50 rounded-3xl -z-10 transform -rotate-3"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 ${isVisible ? 'animate-bounce-gentle' : ''}`}>
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
