"use client"

import { useEffect } from "react"

export default function CarouselScript() {
  useEffect(() => {
    let currentSlide = 0
    const totalSlides = 3

    const carousel = document.getElementById("carousel-container")
    const nextBtn = document.getElementById("next-btn")
    const prevBtn = document.getElementById("prev-btn")

    function updateCarousel() {
      if (carousel) {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`
      }

      // Update dots
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.getElementById(`dot-${i}`)
        if (dot) {
          if (i === currentSlide) {
            dot.className = "w-3 h-3 bg-rose-500 rounded-full transition-all duration-200"
          } else {
            dot.className = "w-3 h-3 bg-gray-300 rounded-full transition-all duration-200"
          }
        }
      }
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides
      updateCarousel()
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides
      updateCarousel()
    }

    // Event listeners
    nextBtn?.addEventListener("click", nextSlide)
    prevBtn?.addEventListener("click", prevSlide)

    // Dot navigation
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.getElementById(`dot-${i}`)
      dot?.addEventListener("click", () => {
        currentSlide = i
        updateCarousel()
      })
    }

    // Auto-play carousel
    const autoPlay = setInterval(nextSlide, 5000)

    // Cleanup
    return () => {
      clearInterval(autoPlay)
      nextBtn?.removeEventListener("click", nextSlide)
      prevBtn?.removeEventListener("click", prevSlide)
    }
  }, [])

  return null
}
