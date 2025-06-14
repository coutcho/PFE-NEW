import React from 'react';
import { Building2, Users, Handshake, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Aboutus = () => {
  return (
    <div className="container-fluid p-0">
      {/* Header/Navbar will go here in a real app */}
      
      {/* Improved About Us Title Section */}
      <section className="py-5" style={{ background: 'linear-gradient(to right, #4a6fa5, #2b4c7e)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 col-md-10 mx-auto text-center">
              <h1 className="display-4 fw-bold text-white mb-3">À propos de nous</h1>
              <div className="bg-white mx-auto mb-4" style={{ height: '3px', width: '80px' }}></div>
              <p className="lead text-white-50 mb-0">
              Votre partenaire de confiance dans la recherche de la maison parfaite
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Property Selling Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="position-relative mb-4">
                <img 
                  src="/value.jpg" 
                  alt="Property Interior Main" 
                  className="img-fluid rounded shadow-sm mb-3"
                  style={{ width: '100%' }}
                />
                <div className="row">
                  <div className="col-6">
                    <img 
                      src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                      alt="Modern Kitchen" 
                      className="img-fluid rounded shadow-sm"
                    />
                  </div>
                  <div className="col-6">
                    <img 
                      src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                      alt="Living Room" 
                      className="img-fluid rounded shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 ps-lg-5">
              <h2 className="display-5 fw-bold mb-4">Notre Histoire</h2>
              <p className="lead text-muted mb-3">
              Avec plus de 25 ans d'expérience sur le marché immobilier, Darek.com aide les familles à trouver la maison de leurs rêves et les investisseurs à prendre des décisions immobilières judicieuses.
              </p>
              <p className="lead text-muted mb-4">
              Nous sommes fiers de notre connaissance approfondie du marché local, de notre engagement envers l'excellence et de notre approche personnalisée pour répondre aux besoins de chaque client.
              </p>
              
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Us Section */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">Pourquoi Nous Choisir ?</h2>
          <p className="lead mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            Notre équipe d'agents immobiliers expérimentés est à votre service pour vous accompagner dans chaque étape de votre projet immobilier, avec professionnalisme et dévouement.
          </p>
          
          <div className="row g-4">
            {/* Card 1 */}
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 border-0 rounded-4 shadow-sm hover-shadow transition-300">
                <div className="card-body py-5 text-center">
                  <div className="d-inline-flex justify-content-center align-items-center bg-primary rounded-circle p-3 mb-4" style={{ width: '70px', height: '70px' }}>
                    <Building2 size={24} color="white" />
                  </div>
                  <h4 className="fw-bold mb-3">Large Gamme de Propriétés</h4>
                  <p className="text-muted">Découvrez notre catalogue diversifié de biens immobiliers adaptés à tous les budgets et styles de vie.</p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 border-0 rounded-4 shadow-sm hover-shadow transition-300">
                <div className="card-body py-5 text-center">
                  <div className="d-inline-flex justify-content-center align-items-center rounded-circle p-3 mb-4" style={{ width: '70px', height: '70px', backgroundColor: '#4a6fa5' }}>
                    <Users size={24} color="white" />
                  </div>
                  <h4 className="fw-bold mb-3">Équipe d'Experts professionnelle</h4>
                  <p className="text-muted">Nos conseillers immobiliers certifiés vous offrent une expertise locale inégalée et un service personnalisé.</p>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 border-0 rounded-4 shadow-sm hover-shadow transition-300">
                <div className="card-body py-5 text-center">
                  <div className="d-inline-flex justify-content-center align-items-center rounded-circle p-3 mb-4" style={{ width: '70px', height: '70px', backgroundColor: '#2b4c7e' }}>
                    <Handshake size={24} color="white" />
                  </div>
                  <h4 className="fw-bold mb-3">Accompagnement Sur Mesure</h4>
                  <p className="text-muted">Nous adaptons nos services à vos besoins spécifiques pour une expérience immobilière sans stress.</p>
                </div>
              </div>
            </div>
            
            {/* Card 4 */}
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 border-0 rounded-4 shadow-sm hover-shadow transition-300">
                <div className="card-body py-5 text-center">
                  <div className="d-inline-flex justify-content-center align-items-center rounded-circle p-3 mb-4" style={{ width: '70px', height: '70px', backgroundColor: '#4a6fa5' }}>
                    <Home size={24} color="white" />
                  </div>
                  <h4 className="fw-bold mb-3">Biens Adaptés à Votre Style de Vie</h4>
                  <p className="text-muted">Nous sélectionnons des propriétés qui correspondent parfaitement à vos critères et aspirations.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3">
            <Link to="/contact" className="btn btn-primary btn-lg px-4 py-2">Nous Contacter</Link>
          </div>
        </div>
      </section>
      
      {/* Rest of the component remains unchanged */}
    </div>
  );
};

export default Aboutus;