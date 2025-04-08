// src/Components/Contact/Contact.jsx
import React, { useState } from 'react';

function Contact() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxChars = 400;
  const charCount = comments.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: Uncomment if you add auth to the endpoint
          // 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ fullName, email, comments }),
      });

      if (response.ok) {
        alert('Votre message a été envoyé avec succès !');
        setFullName('');
        setEmail('');
        setComments('');
      } else {
        throw new Error('Échec de l\'envoi du message');
      }
    } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    alert('Échec de l\'envoi de votre message. Veuillez réessayer plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Main container for the contact form */}
      <div className="container py-5">
        {/* Page Title */}
        <h1 className="mb-3 d-flex justify-content-center align-items-center">
          Contactez Darek.com
        </h1>

        {/* Horizontal rule */}
        <hr />

        {/* Subtitle / Description */}
        <p className="text-secondary text-center">
          Recherchez des annonces immobilières à vendre et à louer. Explorez les valeurs des propriétés, 
          les quartiers, et plus encore sur Darek.com
        </p>

        {/* The Contact Form */}
        <div className="d-flex justify-content-center w-100">
          <form
            onSubmit={handleSubmit}
            className="mt-4 w-100"
            style={{ maxWidth: '600px' }}
          >
            {/* Full Name */}
            <div className="mb-3 w-100">
              <label htmlFor="fullName" className="form-label fw-bold">
                Nom complet <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                className="form-control w-100"
                placeholder="Entrez votre nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3 w-100">
              <label htmlFor="email" className="form-label fw-bold">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                id="email"
                className="form-control w-100"
                placeholder="Entrez votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Comments */}
            <div className="mb-3 w-100">
              <label htmlFor="comments" className="form-label fw-bold">
                Commentaires <span className="text-danger">*</span>
              </label>
              <textarea
                id="comments"
                className="form-control w-100"
                rows="5"
                placeholder="Entrez vos commentaires"
                maxLength={maxChars}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
              />
              <small className="text-muted">
                {charCount} sur {maxChars} caractères maximum.
              </small>
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-center">
              <button
                type="submit"
                className="btn px-4"
                style={{ backgroundColor: '#FF6600', color: '#fff' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;