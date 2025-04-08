import React, { useState, useEffect } from 'react';
import { Phone, Mail } from 'lucide-react';
import PropertyInquiryModal from './PropertyInquiryModal';

export default function ContactAgent({ property, refreshAgent }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');
  const AGENT_API_URL = 'http://localhost:3001/api/users/agents';

  // Récupérer les détails de l'agent basés sur property.agent_id
  useEffect(() => {
    console.log('useEffect déclenché - property.agent_id:', property?.agent_id, 'refreshAgent:', refreshAgent);
    const fetchAgent = async () => {
      if (!property?.agent_id) {
        setLoading(false);
        setError('Aucun agent assigné à ce bien.');
        console.log('Aucun agent_id fourni pour la propriété:', property);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Supprimer l'en-tête Authorization puisque nous voulons que ce soit public
        const response = await fetch(`${AGENT_API_URL}/${property.agent_id}`);
        
        if (!response.ok) {
          throw new Error('Échec de récupération des détails de l\'agent');
        }
        
        const agentData = await response.json();
        setAgent(agentData);
        console.log('Données de l\'agent récupérées avec succès:', agentData);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors de la récupération de l\'agent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [property?.agent_id, refreshAgent]); // Token retiré des dépendances puisqu'il n'est pas nécessaire pour fetch

  // Fonction pour ouvrir la modal (nécessite toujours une connexion)
  const openModal = () => {
    if (!token) {
      setError('Veuillez vous connecter pour contacter l\'agent.');
      return;
    }
    setIsModalOpen(true);
  };

  // Fonction pour fermer la modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Afficher les états de chargement, d'erreur ou d'absence d'agent
  if (loading) return <div>Chargement des détails de l'agent...</div>;
  if (error) return <div className="card mt-4 agent"><div className="card-body"><p className="text-danger">{error}</p></div></div>;
  if (!property?.agent_id || !agent) {
    return (
      <div className="card mt-4 agent">
        <div className="card-body">
          <h2 className="h4 fw-bold">Contacter l'agent</h2>
          <p className="text-muted mt-3">Aucun agent assigné à ce bien.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4 agent">
      <div className="card-body">
        <h2 className="h4 fw-bold">Contacter l'agent</h2>

        {/* Détails de l'agent */}
        <div className="d-flex align-items-center gap-3 mt-3">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
            alt={agent.name}
            className="rounded-circle"
            style={{ width: '64px', height: '64px', objectFit: 'cover' }}
          />
          <div>
            <h3 className="h5 fw-semibold mb-1">{agent.name}</h3>
            <p className="text-muted mb-0">Agent Immobilier</p>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="mt-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Phone className="text-primary" size={20} />
            <span>{agent.phone || 'Téléphone non disponible'}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Mail className="text-primary" size={20} />
            <span>{agent.email || 'Email non disponible'}</span>
          </div>
        </div>

        {/* Formulaire pour déclencher la modale */}
        <form className="mt-4">
          <button type="button" className="btn btn-primary w-100" onClick={openModal}>
            Contacter
          </button>
        </form>

        {/* Intégrer le composant Modal */}
        <PropertyInquiryModal 
          show={isModalOpen} 
          onClose={closeModal} 
          property={property}
        />
      </div>
    </div>
  );
}