import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

function HomeValueHero() {
  const [address, setAddress] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Carousel settings
  const itemsPerView = 3; // Number of images visible at once
  const maxIndex = Math.max(0, selectedFiles.length - itemsPerView);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('authToken'));
  }, []);

  useEffect(() => {
    let timer;
    if (feedback.show) {
      timer = setTimeout(() => {
        setFeedback({ ...feedback, show: false });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [feedback]);

  const showFeedback = (message, type = 'error') => {
    setFeedback({
      show: true,
      message,
      type
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showFeedback('Veuillez vous connecter pour soumettre une demande de valeur de maison.');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    if (!address.trim()) {
      showFeedback('Veuillez entrer une adresse.');
      return;
    }

    // New validation: check if images are uploaded
    if (selectedFiles.length === 0) {
      showFeedback('Veuillez télécharger au moins une image de votre propriété.');
      return;
    }

    const formData = new FormData();
    formData.append('address', address);
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('http://localhost:3001/api/home-values', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la soumission de la demande de valeur de maison');
      }

      const data = await response.json();
      console.log('Réponse du serveur:', data);
      showFeedback('Demande de valeur de maison soumise avec succès! Les experts vont l\'examiner.', 'success');

      setAddress('');
      setSelectedFiles([]);
      setCarouselIndex(0); // Réinitialiser le carrousel
      fileInputRef.current.value = null;
    } catch (error) {
      console.error('Erreur lors de la soumission de la valeur de la maison:', error);
      showFeedback(`Échec de la soumission de la demande de valeur de maison: ${error.message}`);
    }
  };

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    console.log('Fichiers sélectionnés:', files);
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    // Ajuster l'index du carrousel si nécessaire
    if (carouselIndex > maxIndex - 1) {
      setCarouselIndex(Math.max(0, maxIndex - 1));
    }
  };

  const heroStyle = {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/value.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '80vh',
    position: 'relative',
  };

  return (
    <div style={heroStyle} className="d-flex align-items-center">
      {feedback.show && (
        <div
          className={`position-absolute top-0 start-50 translate-middle-x mt-4 alert ${
            feedback.type === 'success' ? 'alert-success' : 'alert-danger'
          } d-flex align-items-center shadow-lg border-0 fade show`}
          style={{
            zIndex: 1050,
            maxWidth: '90%',
            width: '500px',
            padding: '16px 20px',
            borderRadius: '8px',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
          role="alert"
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>
              <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
              {feedback.message}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setFeedback({ ...feedback, show: false })}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 text-center text-white">
            <h1 className="display-4 fw-bold mb-4">Combien vaut ma maison?</h1>
            <p className="lead mb-5">
              Entrez votre adresse pour obtenir votre estimation gratuit et réclamer votre maison,
              sans obligation de la part de Darek.
            </p>

            <form onSubmit={handleSubmit} className="mb-4">
              <div className="row g-2 justify-content-center">
                <div className="col-12 col-lg-8">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Entrez l'adresse de votre maison"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    aria-label="Adresse de la maison"
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-lg w-100"
                    onClick={handleImport}
                  >
                    +
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </form>

            {/* Image Previews with Carousel */}
            {selectedFiles.length > 0 && (
              <div className="text-start bg-dark bg-opacity-50 p-3 rounded mb-3 position-relative">
                <p className="mb-2 text-white-50 small">Images sélectionnées:</p>
                <div
                  className="carousel-container"
                  style={{
                    overflowX: selectedFiles.length > itemsPerView ? 'hidden' : 'visible',
                    position: 'relative',
                  }}
                >
                  <div
                    className="carousel-track"
                    style={{
                      display: 'flex',
                      gap: '10px',
                      transition: 'transform 0.3s ease',
                      transform: `translateX(-${carouselIndex * (100 + 10)}px)`, // 100px width + 10px gap
                    }}
                  >
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="position-relative"
                        style={{
                          width: '100px',
                          height: '100px',
                        }}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Aperçu ${file.name}`}
                          className="rounded"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0"
                          style={{
                            width: '20px',
                            height: '20px',
                            padding: 0,
                            borderRadius: '50%',
                            transform: 'translate(50%, -50%)',
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Navigation */}
                {selectedFiles.length > itemsPerView && (
                  <>
                    <button
                      className="carousel-btn carousel-btn-left"
                      onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                      disabled={carouselIndex === 0}
                      style={{
                        position: 'absolute',
                        left: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 1,
                      }}
                    >
                      &lt;
                    </button>
                    <button
                      className="carousel-btn carousel-btn-right"
                      onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))}
                      disabled={carouselIndex === maxIndex}
                      style={{
                        position: 'absolute',
                        right: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 1,
                      }}
                    >
                      &gt;
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .carousel-container {
          width: 100%;
        }
        .carousel-track {
          flex-wrap: nowrap;
        }
        .carousel-btn {
          opacity: 5;
          transition: opacity 0.2s ease;
        }
        .carousel-btn:hover {
          opacity: 1;
        }
        .carousel-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default HomeValueHero;