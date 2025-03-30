// src/components/ui/Motion.js
import { useEffect, useRef, useState } from 'react';

export default function Motion({
  children,
  animation = 'fade',
  direction = 'up',
  delay = 0,
  duration = 500,
  distance = 20,
  once = true,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.disconnect();
      }
    };
  }, [once]);

  // Define transform properties based on direction
  let initialTransform = 'none';
  if (animation === 'fade') {
    switch (direction) {
      case 'up':
        initialTransform = `translateY(${distance}px)`;
        break;
      case 'down':
        initialTransform = `translateY(-${distance}px)`;
        break;
      case 'left':
        initialTransform = `translateX(${distance}px)`;
        break;
      case 'right':
        initialTransform = `translateX(-${distance}px)`;
        break;
    }
  } else if (animation === 'zoom') {
    initialTransform = direction === 'in' ? 'scale(0.95)' : 'scale(1.05)';
  }

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : initialTransform,
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div ref={elementRef} className={className} style={style}>
      {children}
    </div>
  );
}