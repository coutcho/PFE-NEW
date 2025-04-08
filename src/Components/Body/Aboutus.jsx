import React from 'react';
// Remove the problematic import since it's not being used in the component
import 'bootstrap/dist/css/bootstrap.min.css';

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
              <button className="btn btn-primary btn-lg px-4">Learn More</button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Us Section */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">Pourquoi Nous ?</h2>
          <p className="lead mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            Best real estate agents you will ever see in your life. If you encounter any problems do not hesitate to knock our agents.
          </p>
          
          <div className="row g-4">
            {/* Card 1 */}
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 border-0 rounded-4 bg-light">
                <div className="card-body py-5 text-center">
                  <div className="d-inline-flex justify-content-center align-items-center bg-primary rounded-circle p-3 mb-4" style={{ width: '70px', height: '70px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H21V21H3V3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 13V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="fw-bold mb-2">Large gamme de propriétés</h4>
                  <p className="text-muted">Benefits</p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 border-0 rounded-4" style={{ backgroundColor: '#e8f9f5' }}>
                <div className="card-body py-5 text-center">
                  <div className="d-inline-flex justify-content-center align-items-center rounded-circle p-3 mb-4" style={{ width: '70px', height: '70px', backgroundColor: '#808080' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="fw-bold mb-2">Équipe primée</h4>
                  <p className="text-muted">Support</p>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 border-0 rounded-4" style={{ backgroundColor: '#fff5f2' }}>
                <div className="card-body py-5 text-center">
                  <div className="d-inline-flex justify-content-center align-items-center rounded-circle p-3 mb-4" style={{ width: '70px', height: '70px', backgroundColor: '#ff7b54' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 18V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4.93 4.93L7.76 7.76" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.24 16.24L19.07 19.07" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4.93 19.07L7.76 16.24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.24 7.76L19.07 4.93" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="fw-bold mb-2">Service personnalisé</h4>
                  <p className="text-muted">Interest</p>
                </div>
              </div>
            </div>
            
            {/* Card 4 */}
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 border-0 rounded-4 bg-light">
                <div className="card-body py-5 text-center">
                  <div className="d-inline-flex justify-content-center align-items-center bg-primary rounded-circle p-3 mb-4" style={{ width: '70px', height: '70px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="fw-bold mb-2">HOMES THAT MATCH</h4>
                  <p className="text-muted">Lifestyle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer would go here in a real app */}
    </div>
  );
};

export default Aboutus;