"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Sparkles, Star, ArrowRight, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Service } from "@/lib/supabase"
import ServiceBookingButton from "./service-booking-button"

interface ModernServicesProps {
  services: Service[]
}

export default function ModernServices({ services }: ModernServicesProps) {
  const [isVisible, setIsVisible] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (servicesRef.current) {
      observer.observe(servicesRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={servicesRef}
      id="services" 
      className="py-24 bg-gradient-to-br from-white via-slate-50 to-purple-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-float opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full animate-float-delayed opacity-40"></div>
        <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full animate-float opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg mb-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Our Services</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-purple-800 to-rose-800 bg-clip-text text-transparent">
            Indulge in Luxury Nail Care
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From classic treatments to cutting-edge nail art, we offer a complete range of services to keep your nails
            looking absolutely stunning.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {services.map((service, index) => (
            <Card
              key={service.id}
              className={`group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm card-hover ${isVisible ? 'animate-fade-in-up' : ''}`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
              }}
            >
              {/* Service Image */}
              <div className="relative overflow-hidden">
                <Image
                  src={service.image_url || "/placeholder.svg?height=300&width=400"}
                  alt={service.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-purple-600 font-semibold shadow-lg backdrop-blur-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    Birr {service.price}
                  </Badge>
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform scale-0 group-hover:scale-100"></div>
              </div>
              
              {/* Service Content */}
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors duration-300">
                    {service.name}
                  </h3>
                  <span className="text-sm text-slate-500 group-hover:text-white/80 transition-colors duration-300 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration} min
                  </span>
                </div>
                
                <p className="text-slate-600 group-hover:text-white/90 transition-colors duration-300 mb-4 line-clamp-2">
                  {service.description}
                </p>
                
                {/* Service Features */}
                <div className="flex items-center space-x-4 mb-4 text-xs text-slate-500 group-hover:text-white/70 transition-colors duration-300">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>Premium</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span>Expert</span>
                  </div>
                </div>
                
                {/* Booking Button */}
                <div className="transform group-hover:scale-105 transition-transform duration-300">
                  <ServiceBookingButton services={services} serviceId={service.id} />
                </div>
              </CardContent>
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform rotate-45 translate-x-8 -translate-y-8"></div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to Transform Your Look?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Book your appointment today and experience the luxury of professional nail care with our revolutionary booking system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/improved-booking">
                <Button className="btn-primary-modern group">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin transition-all duration-300" />
                  Book Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button variant="outline" className="btn-secondary-modern group">
                  <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
