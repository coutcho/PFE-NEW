import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './ListingCSS.css';

export default function PropertyGallery() {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  // Add state to store loaded image objects
  const [loadedImageObjects, setLoadedImageObjects] = useState({});

  const BASE_URL = 'http://localhost:3001';

  // Fetch property images
  useEffect(() => {
    const fetchPropertyImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/properties/${id}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const property = await response.json();
        const imagePaths = Array.isArray(property.images_path) 
          ? property.images_path 
          : JSON.parse(property.images_path || '[]');
        const fullImageUrls = imagePaths.map(path => `${BASE_URL}${path}`);
        setImages(fullImageUrls);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyImages();
    } else {
      setLoading(false);
      setError('No property ID provided');
    }
  }, [id]);

  // Preload images whenever the images array changes
  useEffect(() => {
    if (images.length > 0) {
      // Create an object to store loaded image objects
      const imageObjects = {};
      
      // Load each image
      images.forEach((url) => {
        // Only create a new Image object if we haven't loaded this URL yet
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
      
      // Update state with loaded images
      if (Object.keys(imageObjects).length > 0) {
        setLoadedImageObjects(prev => ({...prev, ...imageObjects}));
      }
    }
  }, [images]);

  // Eagerly preload the next few images when current image changes
  useEffect(() => {
    if (images.length > 1) {
      // Preload next 2 images
      for (let i = 1; i <= 2; i++) {
        const nextIndex = (currentImage + i) % images.length;
        const nextUrl = images[nextIndex];
        
        if (nextUrl && !loadedImageObjects[nextUrl]) {
          const img = new Image();
          img.src = nextUrl;
          setLoadedImageObjects(prev => ({...prev, [nextUrl]: img}));
        }
      }
    }
  }, [currentImage, images, loadedImageObjects]);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  const toggleOverlay = () => setIsOverlayOpen(!isOverlayOpen);

  if (loading) return <div className="text-center py-5 fw-bold">Loading images...</div>;
  if (error) return <div className="text-center py-5 text-danger fw-bold">Error: {error}</div>;
  if (images.length === 0) return <div className="text-center py-5 fw-bold">No images available for this property</div>;

  // Use the current image URL
  const currentImageUrl = images[currentImage] || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  return (
    <>
      <div className="gallery-container">
        <div className="main-image-container">
          <img 
            src={currentImageUrl} 
            alt={`Property image ${currentImage + 1}`} 
            className="main-image"
            onClick={toggleOverlay}
            // Add a key to help React identify this element uniquely
            key={`carousel-${currentImageUrl}`}
          />
          
          <button 
            onClick={prevImage} 
            className="nav-button prev-button"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={nextImage} 
            className="nav-button next-button"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
          
          <div className="image-counter">
            {currentImage + 1} / {images.length}
          </div>
          
          <div className="dots-container">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`dot ${currentImage === index ? 'active' : ''}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {isOverlayOpen && (
        <div className="fullscreen-overlay" onClick={toggleOverlay}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={currentImageUrl} 
              alt={`Property image ${currentImage + 1}`} 
              className="fullscreen-image" 
              key={`fullscreen-${currentImageUrl}`}
            />
            
            <button 
              className="close-button"
              onClick={toggleOverlay}
              aria-label="Close gallery"
            >
              <X size={32} />
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
              {currentImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}