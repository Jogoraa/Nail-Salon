// Removed 'use client' to make this a Server Component
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Phone, Clock, Instagram, Facebook, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import CarouselScript from "@/components/carousel-script"
import { getServices } from "@/lib/actions"
import ContactForm from "@/components/contact-form" // This is still used in the Contact section
//import BookingButtonsAndModal from "@/components/booking-buttons-and-modal" // Import the new client component

// Import the new client components
import HeroBookingButtons from "@/components/hero-booking-buttons"
import ServiceBookingButton from "@/components/service-booking-button"
import SiteHeader from "@/components/site-header" // Import the new SiteHeader component

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
  // Log the type of SiteHeader to help debug the "Element type is invalid" error
  console.log("Debugging SiteHeader import: typeof SiteHeader =", typeof SiteHeader, "SiteHeader =", SiteHeader)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}

 <SiteHeader services={services} />
      {/* Hero Section */}
      <section id="home" className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200">✨ Premium Nail Care Experience</Badge>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Beautiful Nails,{" "}
                  <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Beautiful You
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Experience Haymi nail care in our serene studio. From classic manicures to stunning nail art, we
                  create beautiful nails that make you feel confident and radiant.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
             
                <HeroBookingButtons services={services} />
              </div>
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-gray-600">4.9/5 (200+ reviews)</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/hero.jpg?height=600&width=500"
                  alt="Luxury nail salon"
                  width={500}
                  height={600}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-rose-200 to-pink-200 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Carousel */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">The Experience</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Immerse Yourself in Luxury</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Step into our world of elegance and discover why our clients call it their sanctuary of beauty.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div className="flex transition-transform duration-500 ease-in-out" id="carousel-container">
                {/* Slide 1 */}
                <div className="min-w-full relative">
                  <div className="grid md:grid-cols-2 min-h-[500px]">
                    <div className="relative">
                      <Image
                            src="/c.jpg?height=500&width=600"
                        alt="Luxury salon interior"
                        width={600}
                        height={500}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-8 md:p-12 flex flex-col justify-center">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Serene Atmosphere</h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                        Relax in our beautifully designed studio with ambient lighting, comfortable seating, and a
                        peaceful environment that melts your stress away.
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 bg-rose-400 rounded-full border-2 border-white"></div>
                          <div className="w-8 h-8 bg-pink-400 rounded-full border-2 border-white"></div>
                          <div className="w-8 h-8 bg-purple-400 rounded-full border-2 border-white"></div>
                        </div>
                        <span className="text-sm text-gray-600">Loved by 1000+ clients</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 2 */}
                <div className="min-w-full relative">
                  <div className="grid md:grid-cols-2 min-h-[500px]">
                    <div className="bg-gradient-to-br from-purple-50 to-rose-50 p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Expert Artistry</h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                        Our skilled nail artists bring years of experience and creativity to every appointment, ensuring
                        your nails are nothing short of perfection.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Certified nail technicians</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Latest techniques & trends</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Premium quality products</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative order-1 md:order-2">
                      <Image
                      src="/b.jpg?height=500&width=600"
                        alt="Expert nail artistry"
                        width={600}
                        height={500}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Slide 3 */}
                <div className="min-w-full relative">
                  <div className="grid md:grid-cols-2 min-h-[500px]">
                    <div className="relative">
                      <Image
                        src="/a.jpg?height=500&width=600"
                        alt="Beautiful nail designs"
                        width={600}
                        height={500}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 md:p-12 flex flex-col justify-center">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Stunning Results</h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                        From classic elegance to bold artistic expressions, we create nail designs that perfectly
                        reflect your personality and style.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-rose-600">2-3</div>
                          <div className="text-xs text-gray-600">Weeks Lasting</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-rose-600">100+</div>
                          <div className="text-xs text-gray-600">Color Options</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              id="prev-btn"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              id="next-btn"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              <button className="w-3 h-3 bg-rose-500 rounded-full transition-all duration-200" id="dot-0"></button>
              <button className="w-3 h-3 bg-gray-300 rounded-full transition-all duration-200" id="dot-1"></button>
              <button className="w-3 h-3 bg-gray-300 rounded-full transition-all duration-200" id="dot-2"></button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">Our Services</Badge>
            <h2 className="text-4xl font-bold mb-4">Indulge in Luxury Nail Care</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From classic treatments to cutting-edge nail art, we offer a complete range of services to keep your nails
              looking absolutely stunning.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={service.image_url || "/placeholder.svg?height=300&width=400"}
                    alt={service.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-rose-600 font-semibold">Birr {service.price}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration} min
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {/* Make this button open the modal */}
                  <ServiceBookingButton services={services} serviceId={service.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">Our Work</Badge>
            <h2 className="text-4xl font-bold mb-4">Stunning Nail Artistry</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our portfolio of beautiful nail designs and see why our clients love coming back for more.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Gallery image ${index + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent">
              View More on Instagram
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200">About Us</Badge>
              <h2 className="text-4xl font-bold">Where Beauty Meets Artistry</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At Haymi Nail Studio, we believe that beautiful nails are more than just a beauty treatment – they're a
                form of self-expression. Our team of skilled nail artists combines years of experience with the latest
                techniques to create stunning results that exceed your expectations.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We use only premium, cruelty-free products and maintain the highest standards of hygiene and safety. Our
                serene studio environment is designed to help you relax and unwind while we pamper you with exceptional
                service.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">5+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">1000+</div>
                  <div className="text-sm text-gray-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">50+</div>
                  <div className="text-sm text-gray-600">Nail Designs</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                      src="/d.jpg?height=500&width=600"
                alt="Nail salon interior"
                width={500}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 mb-4">Get In Touch</Badge>
            <h2 className="text-4xl font-bold mb-4">Visit Our Studio</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to treat yourself? Book an appointment today and experience the luxury of professional nail care.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Card className="p-8 shadow-xl border-0">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-gray-600">Addis Ababa, Bole District, HAYMI</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-gray-600">(+2519) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Hours</h4>
                    <p className="text-gray-600">Mon-Sat: 9AM-7PM, Sun: 10AM-5PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                </div>
              </div>
            </Card>
            <ContactForm services={services} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="text-xl font-bold">HAYMI NAIL CARE</span>
              </div>
              <p className="text-gray-400">Creating beautiful nails and confident smiles since 2019.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Classic Manicure</li>
                <li>Gel Manicure</li>
                <li>Luxury Pedicure</li>
                <li>Nail Art Design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#home" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-white transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="#gallery" className="hover:text-white transition-colors">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Addis Ababa</li>
                <li>Haymi Nail care</li>
                <li>(+2519) 123-4567</li>
                <li>hello@HarmiNail.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Haymi Nail Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <CarouselScript />
    </div>
  )
}
