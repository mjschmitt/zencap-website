// src/components/ui/TestimonialSlider.js
import { useState, useEffect, useCallback } from 'react';
import Card from './Card';

export default function TestimonialSlider({ testimonials }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Wrap next in useCallback
  const next = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, [animating, testimonials.length]);

  // Wrap prev in useCallback too for consistency
  const prev = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  }, [animating, testimonials.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Auto-advance the slider every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(interval);
  }, [next]);  // now this dependency is stable

  return (
    <div className="relative overflow-hidden py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Testimonial Slider */}
        <div className="relative h-64 md:h-56">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`absolute w-full transition-all duration-500 ${
                index === currentIndex
                  ? 'opacity-100 translate-x-0'
                  : index < currentIndex
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
              }`}
            >
              <Card className="h-full flex flex-col justify-between p-6">
                <p className="italic text-gray-600 mb-4">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center mt-auto">
                  <div className="h-10 w-10 bg-navy-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-navy-700 font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy-700">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!animating) {
                  setAnimating(true);
                  setCurrentIndex(index);
                }
              }}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-navy-700 w-6' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow Navigation */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            onClick={prev}
            className="bg-white rounded-full shadow-md p-2 ml-4 focus:outline-none focus:ring-2 focus:ring-navy-500"
            aria-label="Previous testimonial"
          >
            <svg className="h-5 w-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={next}
            className="bg-white rounded-full shadow-md p-2 mr-4 focus:outline-none focus:ring-2 focus:ring-navy-500"
            aria-label="Next testimonial"
          >
            <svg className="h-5 w-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}