import { useState, useRef, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import './ListingCSS.css';

function PropertyInquiryModal({ show, onClose, property, onInquirySubmitted }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: 'Bonjour, je souhaiterais avoir plus d\'informations sur cette annonce.',
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Create a ref for the modal content
  const modalContentRef = useRef(null);

  const token = localStorage.getItem('authToken');
  const API_INQUIRIES_URL = 'http://localhost:3001/api/inquiries';

  // Effect to scroll to top when success state changes to true
  useEffect(() => {
    if (success && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const timeSlots = [
    { time: '9:00 AM', label: 'Matin - 9:00' },
    { time: '10:00 AM', label: 'Matin - 10:00' },
    { time: '11:00 AM', label: 'Matin - 11:00' },
    { time: '12:00 PM', label: 'Après-midi - 12:00' },
    { time: '1:00 PM', label: 'Après-midi - 13:00' },
    { time: '2:00 PM', label: 'Après-midi - 14:00' },
    { time: '3:00 PM', label: 'Après-midi - 15:00' },
    { time: '4:00 PM', label: 'Après-midi - 16:00' },
  ];

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date,
      formatted: format(date, 'MMM d'),
      day: format(date, 'EEE'),
      fullDate: format(date, 'EEEE, MMMM d, yyyy'),
    };
  });

  const handleDateClick = (date) => {
    setSelectedDate(selectedDate && format(selectedDate, 'MMM d') === format(date, 'MMM d') ? null : date);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(selectedTime === time ? null : time);
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email) {
      setError('Nom complet et Email sont obligatoires.');
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
      return;
    }

    // Construct the message with tour request details (if any)
    let finalMessage = formData.message;
    if (selectedDate && selectedTime) {
      const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
      finalMessage += `\n\nDemande de visite: J'aimerais planifier une visite le ${formattedDate} à ${selectedTime}.`;
    } else if (selectedDate) {
      const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
      finalMessage += `\n\nDemande de visite: J'aimerais planifier une visite le ${formattedDate}.`;
    }

    const inquiryData = {
      property_id: property?.id,
      agent_id: property?.agent_id || null,
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone || null,
      message: finalMessage, // Use the modified message with tour details
      tour_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      tour_time: selectedTime || null,
    };

    try {
      const response = await fetch(API_INQUIRIES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec de l'envoi de la demande: ${errorText}`);
      }

      setSuccess(true);
      setError(null);

      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }

      setTimeout(() => {
        if (onInquirySubmitted) {
          onInquirySubmitted();
        } else {
          onClose();
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSuccess(false);
      console.error('Erreur lors de la soumission de la demande:', err);
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content scrollable-content" ref={modalContentRef}>
          <div className="modal-header bg-light">
            <div>
              <h5 className="modal-title">{property?.title || 'Titre de la propriété'}</h5>
              <small className="text-muted">Planifier une visite ou demander des informations</small>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Success/Error Messages */}
            {success && (
              <div className="alert alert-success" role="alert">
                Demande envoyée avec succès !
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Contact Information */}
            <div className="row mb-4">
              <div className="col-md-12">
                <h6 className="mb-3">Informations de contact</h6>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Nom complet*</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Entrez votre nom complet"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Adresse email*</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Entrez votre email"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Numéro de téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <h6 className="mb-3">Votre message</h6>
              <textarea
                name="message"
                className="form-control"
                rows="3"
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            {/* Tour Request */}
            <div className="mb-4">
              <h6 className="mb-3">Demander une visite (Optionnel)</h6>
              <div className="date-selection mb-3">
                <label className="form-label">Sélectionnez une date</label>
                <div className="d-flex flex-wrap gap-2">
                  {dateOptions.map(({ date, formatted, day, fullDate }) => (
                    <button
                      key={formatted}
                      className={`btn btn-outline-primary position-relative ${
                        selectedDate && format(selectedDate, 'MMM d') === formatted ? 'active' : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDateClick(date);
                      }}
                      title={fullDate}
                    >
                      <small className="d-block text-muted">{day}</small>
                      <strong>{formatted}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="time-selection">
                <label className="form-label">Sélectionnez une heure</label>
                <div className="row g-2">
                  {timeSlots.map(({ time, label }) => (
                    <div className="col-md-3" key={time}>
                      <button
                        className={`btn btn-outline-primary w-100 ${selectedTime === time ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleTimeClick(time);
                        }}
                      >
                        {time}
                      </button>
                    </div>
                  ))}
                </div>
                <small className="text-muted d-block mt-2">
                  ⏰ Les horaires sont indiqués dans le fuseau horaire local
                </small>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top">
            <button
              className="btn btn-warning w-100"
              style={{ backgroundColor: '#fd7e14' }}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              Envoyer un message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyInquiryModal;