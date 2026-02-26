import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageModal = ({ images, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 sm:top-4 right-2 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 border border-white/20 transition-all z-50"
      >
        <X size={20} className="sm:hidden" />
        <X size={24} className="hidden sm:block" />
      </button>

      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        className="absolute left-2 sm:left-4 w-10 h-10 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 border border-white/20 transition-all z-50"
      >
        <ChevronLeft size={24} className="sm:hidden" />
        <ChevronLeft size={32} className="hidden sm:block" />
      </button>

      {/* Main Image */}
      <div className="max-w-6xl max-h-[90vh] mx-auto px-4 sm:px-16 bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-white/10 shadow-2xl">
        <img
          src={images[currentIndex]}
          alt={`Hotel view ${currentIndex + 1}`}
          className="w-full h-full object-contain rounded-lg"
        />
        <div className="text-center mt-4 text-white font-medium bg-white/10 backdrop-blur-sm py-2 rounded-lg">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 w-10 h-10 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 border border-white/20 transition-all z-50"
      >
        <ChevronRight size={24} className="sm:hidden" />
        <ChevronRight size={32} className="hidden sm:block" />
      </button>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 max-w-4xl overflow-x-auto bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-xl border border-white/20">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`shrink-0 w-12 h-12 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
              idx === currentIndex ? 'border-vivid-cyan shadow-lg scale-105' : 'border-white/30 hover:border-white/50'
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageModal;