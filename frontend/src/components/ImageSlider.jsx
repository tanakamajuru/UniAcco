import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageSlider({ images, autoplay = true, autoplayDelay = 4000 }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi || !isPlaying) return;

    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayDelay);

    return () => clearInterval(autoplayInterval);
  }, [emblaApi, isPlaying, autoplayDelay]);

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Main carousel */}
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
              <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Image overlay with description */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <AnimatePresence>
                      {image.title && (
                        <motion.h3
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="text-white font-semibold text-lg mb-2"
                        >
                          {image.title}
                        </motion.h3>
                      )}
                      {image.description && (
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ delay: 0.1 }}
                          className="text-white/90 text-sm"
                        >
                          {image.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !p-2 !rounded-full !shadow-lg !opacity-0 group-hover:!opacity-100 !transition-all !duration-300 hover:!scale-110 !cursor-pointer !border-0 !outline-none"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#E8EEF4',
              color: '#2E4057',
              border: '1px solid #D1DDE8',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              opacity: '0',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#D1DDE8';
              e.target.style.color = '#1A1F2E';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#E8EEF4';
              e.target.style.color = '#2E4057';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !p-2 !rounded-full !shadow-lg !opacity-0 group-hover:!opacity-100 !transition-all !duration-300 hover:!scale-110 !cursor-pointer !border-0 !outline-none"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#E8EEF4',
              color: '#2E4057',
              border: '1px solid #D1DDE8',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              opacity: '0',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#D1DDE8';
              e.target.style.color = '#1A1F2E';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#E8EEF4';
              e.target.style.color = '#2E4057';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Autoplay control */}
      {images.length > 1 && autoplay && (
        <button
          onClick={toggleAutoplay}
          className="!absolute !top-4 !right-4 !p-2 !rounded-full !shadow-lg !opacity-0 group-hover:!opacity-100 !transition-all !duration-300 !cursor-pointer !border-0 !outline-none"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: '#E8EEF4',
            color: '#2E4057',
            border: '1px solid #D1DDE8',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            opacity: '0',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#D1DDE8';
            e.target.style.color = '#1A1F2E';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#E8EEF4';
            e.target.style.color = '#2E4057';
          }}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="!rounded-full !transition-all !duration-300 !cursor-pointer !border-0 !outline-none"
              style={{
                width: index === selectedIndex ? '32px' : '8px',
                height: '8px',
                backgroundColor: index === selectedIndex ? '#4A90E2' : '#D1DDE8',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (index !== selectedIndex) {
                  e.target.style.backgroundColor = '#4A90E2';
                  e.target.style.opacity = '0.5';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== selectedIndex) {
                  e.target.style.backgroundColor = '#D1DDE8';
                  e.target.style.opacity = '1';
                }
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
