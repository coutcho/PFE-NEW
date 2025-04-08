import { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import './ProfileCSS.css'

function Profile() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isFormModified, setIsFormModified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch('http://localhost:3001/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setFormData(prev => ({
          ...prev,
          fullName: userData.fullname || '',
          phone: userData.phone || '',
          email: userData.email || ''
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Échec du chargement des données de profil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsFormModified(true);
    // Effacer les messages lors de modifications
    setSuccessMessage(null);
    setError(null);
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
    setIsFormModified(true);
    // Effacer les messages lors de modifications
    setSuccessMessage(null);
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email
      };

      if (formData.password && formData.confirmPassword) {
        updateData.password = formData.password;
      }

      const response = await fetch('http://localhost:3001/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la mise à jour du profil');
      }

      console.log('Profile updated successfully');
      setSuccessMessage('Profil mis à jour avec succès !');
      setIsFormModified(false);
      
      // Effacer les champs de mot de passe après une mise à jour réussie
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordUpdateValid = () => {
    return (!formData.password && !formData.confirmPassword) || 
           (formData.password && 
            formData.confirmPassword && 
            formData.password === formData.confirmPassword);
  };

  return (
    <div className="d-flex">
      <div className="profile-sidebar">
        <h1 className="profile-sidebar-title">Paramètres du Compte</h1>
        <nav className="nav flex-column">
          <div className="profile-nav-link active">
            Paramètres du Profil
          </div>
        </nav>
      </div>

      <main className="profile-main-content">
        <div className="profile-form-section">
          <h2 className="profile-page-title">Paramètres du Profil</h2>
          {isLoading && <div className="alert alert-info">Chargement...</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          <form onSubmit={handleSave} className="profile-form">
            <div className="mb-4">
              <label htmlFor="fullName" className="form-label">Nom Complet</label>
              <input
                type="text"
                className="form-control"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Entrez votre nom complet"
                disabled={isLoading}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label htmlFor="phone" className="form-label">Téléphone</label>
                <IMaskInput
                  className="form-control"
                  id="phone"
                  name="phone"
                  mask="0000000000"
                  value={formData.phone}
                  onAccept={handlePhoneChange}
                  placeholder="Entrer votre numéro"
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Entrez votre email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label htmlFor="password" className="form-label">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Entrez le nouveau mot de passe"
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label htmlFor="confirmPassword" className="form-label">Confirmer le Mot de Passe</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmez le nouveau mot de passe"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!isFormModified || !isPasswordUpdateValid() || isLoading}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;