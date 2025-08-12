import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Phone, Clock, Instagram, Facebook, Twitter, Sparkles, ArrowRight, CheckCircle, Zap, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getServices } from "@/lib/actions"
import ContactForm from "@/components/contact-form"
import ModernSiteHeader from "@/components/modern-site-header"
import ModernHero from "@/components/modern-hero"
import ModernServices from "@/components/modern-services"
import CarouselSection from "@/components/carousel-section"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
                                                                      //                                                                                                                                                            
export default async function NailSalonWebsite() {
  const services = await getServices()

  const galleryImages = [                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
    "/9587540.png?height=400&width=400",
    "/9587518.png?height=400&width=400",
    "/9587542.jpg?height=400&width=400",                                                                                                                                            
    "/9587543.jpg?height=400&width=400",
    "/9587545.jpg?height=400&width=400",
    "/9587546.jpg?height=400&width=400",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <ModernSiteHeader services={services} />
      
    
      <ModernHero services={services} />
      <CarouselSection />
      <ModernServices services={services} />

      <section className="py-20 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
        
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Experience Our Revolutionary Booking System
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-purple-100 max-w-3xl mx-auto leading-relaxed">
              Say goodbye to booking conflicts! Our AI-powered system shows you real-time availability based on your selected services, 
              ensuring you only see times that actually work for your appointment.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/improved-booking">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try Revolutionary Booking
                </Button>
              </Link>
              <Link href="#services">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg font-semibold backdrop-blur-sm hover:border-white/50 transition-all duration-300">
                  Explore All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="py-24 bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-pink-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full shadow-lg mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Our Work</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-pink-800 to-rose-800 bg-clip-text text-transparent">
              Stunning Nail Artistry
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Browse through our portfolio of beautiful nail designs and see why our clients love coming back for more.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Gallery image ${index + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-semibold text-lg mb-2">Nail Design #{index + 1}</h3>
                  <p className="text-white/80 text-sm">Beautiful nail art created by our expert artists</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent px-8 py-3 text-lg font-semibold hover:border-purple-400 transition-all duration-300">
              <Instagram className="w-5 h-5 mr-2" />
              View More on Instagram
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">About Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                Where Beauty Meets Artistry
              </h2>
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                At Haymi Nail Studio, we believe that beautiful nails are more than just a beauty treatment – they're a
                form of self-expression. Our team of skilled nail artists combines years of experience with the latest
                techniques to create stunning results that exceed your expectations.
              </p>
                <p>
                We use only premium, cruelty-free products and maintain the highest standards of hygiene and safety. Our
                serene studio environment is designed to help you relax and unwind while we pamper you with exceptional
                service.
              </p>
              </div>
              
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center group">
                  <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2 group-hover:scale-110 transition-transform duration-300">
                    5+
                  </div>
                  <div className="text-slate-300 text-sm font-medium">Years Experience</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2 group-hover:scale-110 transition-transform duration-300">
                    1000+
                  </div>
                  <div className="text-slate-300 text-sm font-medium">Happy Clients</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2 group-hover:scale-110 transition-transform duration-300">
                    50+
                  </div>
                  <div className="text-slate-300 text-sm font-medium">Nail Designs</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <Image
                    src="/d.jpg?height=600&width=700"
                alt="Nail salon interior"
                    width={700}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 via-transparent to-transparent"></div>
                </div>
                
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl shadow-xl transform rotate-12 animate-float"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl shadow-xl transform -rotate-12 animate-float-delayed"></div>
              </div>
              
              <div className="absolute -top-8 -right-8 w-full h-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-3xl -z-10 transform rotate-3"></div>
              <div className="absolute -bottom-8 -left-8 w-full h-full bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-3xl -z-10 transform -rotate-3"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-gradient-to-br from-white via-slate-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Get In Touch</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-purple-800 to-rose-800 bg-clip-text text-transparent">
              Ready to Transform Your Nails?
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Ready to treat yourself? Book an appointment today and experience the luxury of professional nail care.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <ContactForm services={services} />
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                      <h4 className="font-semibold">Location</h4>
                      <p className="text-purple-100">123 Beauty Street, Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                  
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                      <p className="text-purple-100">+251 911 123 456</p>
                    </div>
                  </div>
                  
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Hours</h4>
                      <p className="text-purple-100">Mon-Sat: 9:00 AM - 7:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold mb-6 text-slate-900">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Twitter className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Haymi Nail Care
                  </h3>
                  <p className="text-sm text-slate-400">Premium Nail Care Experience</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Creating beautiful nails and confident smiles since 2019.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#services" className="hover:text-white transition-colors">Manicures</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Pedicures</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Nail Art</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Gel Extensions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
                <li><Link href="/improved-booking" className="hover:text-white transition-colors">Book Now</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Addis Ababa, Ethiopia</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+251 911 123 456</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>9:00 AM - 7:00 PM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 Haymi Nail Care. All rights reserved. | Designed with ❤️ for beautiful nails
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
