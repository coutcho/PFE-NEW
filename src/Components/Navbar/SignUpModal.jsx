import { useState } from 'react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

function SignUpModal({ show, onClose, onSignInClick }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Le nom complet est requis';
    } else if (/\d/.test(formData.fullName)) {
      newErrors.fullName = 'Le nom complet ne peut pas contenir de chiffres';
    }

    if (!formData.email) newErrors.email = 'L\'email est requis';

    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { fullName, email, password } = formData;
      const dataToSend = { 
        nom: fullName,
        prenom: '',
        email, 
        pass: password 
      };

      try {
        const response = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(data.message || 'Compte créé avec succès ! Bienvenue à bord !');
          setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
          setErrors({});
          setServerError('');
          setTimeout(() => {
            onClose();
            setSuccessMessage('');
          }, 2000);
        } else {
          setServerError(data.message || 'Une erreur est survenue lors de l\'inscription.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        setServerError('Erreur réseau. Veuillez réessayer.');
      }
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Créer un compte</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fermer"></button>
            </div>
            <div className="modal-body px-4">
              {successMessage ? (
                <div className="text-center py-4">
                  <div className="alert alert-success">{successMessage}</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {serverError && <div className="alert alert-danger">{serverError}</div>}
                  
                  <div className="mb-3">
                    <input
                      type="text"
                      name="fullName"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      placeholder="Nom complet"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Adresse email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirmer le mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                  <button type="submit" className="btn btn-success w-100 mb-3">
                    S'inscrire
                  </button>
                  <div className="text-center mb-3">
                    <span className="text-muted">ou s'inscrire avec</span>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <button type="button" className="btn btn-outline-secondary flex-grow-1">
                      <FaGoogle className="me-2" />
                      Google
                    </button>
                    <button type="button" className="btn btn-outline-secondary flex-grow-1">
                      <FaFacebook className="me-2" />
                      Facebook
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="text-muted">Vous avez déjà un compte? </span>
                    <a
                      href="#"
                      className="text-primary text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onSignInClick();
                      }}
                    >
                      Se connecter
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}

export default SignUpModal;