import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import "./ListingCSS.css";

export default function PropertyGallery() {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadedImageObjects, setLoadedImageObjects] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('next'); // 'next' or 'prev'
  
  const IMAGES_PER_PAGE = 5;
  const BASE_URL = 'http://localhost:3001';
  const MAX_VISIBLE_DOTS = 7; // Maximum number of visible dots

  // Fetch property images
  useEffect(() => {
    const fetchPropertyImages = async () => {
      try {
        setLoading(true);
        // If this is a demo, use placeholder images
        if (!id || id === 'demo') {
          const demoImages = [
            '/placeholder.svg',
            '/placeholder.svg',
            '/placeholder.svg',
            '/placeholder.svg',
            '/placeholder.svg',
            '/placeholder.svg',
            '/placeholder.svg',
            '/placeholder.svg'
          ];
          setImages(demoImages);
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/api/properties/${id}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const property = await response.json();
        const imagePaths = Array.isArray(property.images_path) 
          ? property.images_path 
          : JSON.parse(property.images_path || '[]');
        const fullImageUrls = imagePaths.map((path) => `${BASE_URL}${path}`);
        setImages(fullImageUrls);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyImages();
  }, [id]);

  // Preload images whenever the images array changes
  useEffect(() => {
    if (images.length > 0) {
      const imageObjects = {};
      
      images.forEach((url) => {
        if (!loadedImageObjects[url]) {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            console.log(`Image loaded: ${url}`);
          };
          img.onerror = (e) => {
            console.error(`Failed to load image: ${url}`, e);
          };
          imageObjects[url] = img;
        }
      });
      
      if (Object.keys(imageObjects).length > 0) {
        setLoadedImageObjects(prev => ({...prev, ...imageObjects}));
      }
    }
  }, [images]);

  const openLightbox = (index) => {
    // Calculate the actual index in the full images array
    const actualIndex = currentPage * IMAGES_PER_PAGE + index;
    setSelectedImage(actualIndex);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  const nextImage = () => {
    if (selectedImage !== null && images.length > 0) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null && images.length > 0) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  const changePage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < totalPages && pageIndex !== currentPage) {
      // Set transition direction based on target page index
      setTransitionDirection(pageIndex > currentPage ? 'next' : 'prev');
      
      // Start transition
      setIsTransitioning(true);
      
      // After transition starts, change page
      setTimeout(() => {
        setCurrentPage(pageIndex);
        
        // End transition after a delay to let new content render
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 300); // This should match the CSS transition duration
    }
  };

  // Get current page of images
  const getCurrentPageImages = () => {
    const startIndex = currentPage * IMAGES_PER_PAGE;
    return images.slice(startIndex, startIndex + IMAGES_PER_PAGE);
  };

  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const showPagination = images.length > IMAGES_PER_PAGE;

  // Function to render pagination dots with logic for when there are many pages
  const renderPaginationDots = () => {
    // If we have fewer pages than our maximum visible dots, show all dots
    if (totalPages <= MAX_VISIBLE_DOTS) {
      return Array.from({ length: totalPages }, (_, i) => (
        <button
          key={`page-dot-${i}`}
          className={`pagination-dot ${i === currentPage ? 'active' : ''}`}
          onClick={() => changePage(i)}
          aria-label={`Go to page ${i + 1}`}
        />
      ));
    }
    
    // Otherwise, we need to selectively show dots with ellipsis
    const dots = [];
    
    // Always show first dot
    dots.push(
      <button
        key="page-dot-0"
        className={`pagination-dot ${currentPage === 0 ? 'active' : ''}`}
        onClick={() => changePage(0)}
        aria-label="Go to first page"
      />
    );
    
    // Calculate the range of dots to display around the current dot
    const range = Math.floor((MAX_VISIBLE_DOTS - 2) / 2); // subtract 2 for first and last dots
    
    // Start of range, either after the first dot or adjacent to it
    let startPage = Math.max(1, currentPage - range);
    
    // End of range, either before the last dot or adjacent to it
    let endPage = Math.min(totalPages - 2, currentPage + range);
    
    // Adjust if we're too close to either end
    if (currentPage < range + 1) {
      endPage = Math.min(totalPages - 2, MAX_VISIBLE_DOTS - 3);
    } else if (currentPage > totalPages - (range + 2)) {
      startPage = Math.max(1, totalPages - (MAX_VISIBLE_DOTS - 2));
    }
    
    // If the startPage is not right after the first dot, add an ellipsis
    if (startPage > 1) {
      dots.push(
        <span key="ellipsis-start" className="pagination-ellipsis">…</span>
      );
    }
    
    // Add the range of dots
    for (let i = startPage; i <= endPage; i++) {
      dots.push(
        <button
          key={`page-dot-${i}`}
          className={`pagination-dot ${i === currentPage ? 'active' : ''}`}
          onClick={() => changePage(i)}
          aria-label={`Go to page ${i + 1}`}
        />
      );
    }
    
    // If the endPage is not right before the last dot, add an ellipsis
    if (endPage < totalPages - 2) {
      dots.push(
        <span key="ellipsis-end" className="pagination-ellipsis">…</span>
      );
    }
    
    // Always show last dot
    dots.push(
      <button
        key={`page-dot-${totalPages - 1}`}
        className={`pagination-dot ${currentPage === totalPages - 1 ? 'active' : ''}`}
        onClick={() => changePage(totalPages - 1)}
        aria-label="Go to last page"
      />
    );
    
    return dots;
  };

  if (loading) return <div className="flex justify-center items-center h-48 text-lg font-bold">Loading images...</div>;
  if (error) return <div className="flex justify-center items-center h-48 text-lg font-bold text-red-500">Error: {error}</div>;
  if (images.length === 0) return <div className="flex justify-center items-center h-48 text-lg font-bold">No images available for this property</div>;

  const gridTransitionClass = isTransitioning 
    ? `grid-transition ${transitionDirection === 'next' ? 'slide-out-left' : 'slide-out-right'}` 
    : '';

  return (
    <>
      <div className="property-grid-container">
        <div className={`property-grid ${gridTransitionClass}`}>
          {getCurrentPageImages().map((image, index) => (
            <div 
              key={`grid-image-${currentPage}-${index}`}
              className={`grid-item ${index === 0 ? "grid-item-featured" : ""}`}
              onClick={() => openLightbox(index)}
            >
              <div className="relative w-full h-full overflow-hidden rounded-md group">
                <img 
                  src={image} 
                  alt={`Property ${currentPage * IMAGES_PER_PAGE + index + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Dot Pagination */}
        {showPagination && (
          <div className="pagination-controls">
            <div className="pagination-dots">
              {renderPaginationDots()}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {selectedImage !== null && (
        <div className="fullscreen-overlay" onClick={closeLightbox}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[selectedImage]} 
              alt={`Property image ${selectedImage + 1}`} 
              className="fullscreen-image"
            />
            <button 
              className="close-button"
              onClick={closeLightbox}
              aria-label="Close gallery"
            >
              <X size={24} />
            </button>
            <button 
              className="fullscreen-nav prev-fullscreen"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ChevronLeft size={48} />
            </button>
            <button 
              className="fullscreen-nav next-fullscreen"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight size={48} />
            </button>
            <div className="fullscreen-counter">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}