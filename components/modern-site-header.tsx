"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Sparkles, Phone, MapPin, Clock, Instagram, Facebook, Twitter } from "lucide-react"
import Link from "next/link"
import type { Service } from "@/lib/supabase"

interface ModernSiteHeaderProps {
  services: Service[]
}

export default function ModernSiteHeader({ services }: ModernSiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20' 
        : 'bg-transparent'
    }`}>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+251 911 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>9:00 AM - 7:00 PM</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-purple-200 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-purple-200 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-purple-200 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Haymi Nail Care
                </h1>
                <p className="text-xs text-slate-500">Premium Nail Care Experience</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-slate-700 hover:text-purple-600 font-medium transition-colors duration-200">
                Home
              </Link>
              <Link href="#services" className="text-slate-700 hover:text-purple-600 font-medium transition-colors duration-200">
                Services
              </Link>
              <Link href="#gallery" className="text-slate-700 hover:text-purple-600 font-medium transition-colors duration-200">
                Gallery
              </Link>
              <Link href="#about" className="text-slate-700 hover:text-purple-600 font-medium transition-colors duration-200">
                About
              </Link>
              <Link href="#contact" className="text-slate-700 hover:text-purple-600 font-medium transition-colors duration-200">
                Contact
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* New Booking System Badge */}
              <Link href="/improved-booking">
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  ✨ New Booking
                </Button>
              </Link>
              
              {/* Admin Access */}
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200">
                  Admin
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">Haymi</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-slate-700" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-4 mb-8">
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Home
                </Link>
                <Link 
                  href="#services" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Services
                </Link>
                <Link 
                  href="#gallery" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Gallery
                </Link>
                <Link 
                  href="#about" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium"
                >
                  About
                </Link>
                <Link 
                  href="#contact" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Contact
                </Link>
              </nav>

              {/* Mobile CTA Buttons */}
              <div className="space-y-4">
                <Link href="/improved-booking" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    ✨ New Booking System
                  </Button>
                </Link>
                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50">
                    Admin Access
                  </Button>
                </Link>
              </div>

              {/* Contact Info in Mobile Menu */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-purple-500" />
                    <span>+251 911 123 456</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span>Addis Ababa, Ethiopia</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>9:00 AM - 7:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
