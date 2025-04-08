import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <ul className="nav justify-content-center border-bottom pb-3 mb-4">
              <li className="nav-item">
                <Link to="/" className="nav-link px-3 text-light hover-overlay">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/listings" className="nav-link px-3 text-light">Annonces</Link>
              </li>
              <li className="nav-item">
                <Link to="/home-value" className="nav-link px-3 text-light">Estimation</Link>
              </li>
              <li className="nav-item">
                <Link to="/about-us" className="nav-link px-3 text-light">À propos</Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className="nav-link px-3 text-light">Contactez-nous</Link>
              </li>
            </ul>
            <div className="text-center">
              <p className="mb-0">© 2025 Darek.com. Tous droits réservés.</p>
              <div className="mt-3">
                <a href="#" className="text-light me-3"><i className="bi bi-facebook"></i></a>
                <a href="#" className="text-light me-3"><i className="bi bi-twitter"></i></a>
                <a href="#" className="text-light me-3"><i className="bi bi-instagram"></i></a>
                <a href="#" className="text-light"><i className="bi bi-linkedin"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;