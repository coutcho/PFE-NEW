import { Link, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaHome, FaUsers, FaInbox, FaCog, FaSignOutAlt } from 'react-icons/fa';

function NavbarD() {
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        // Optional: Make an API call to logout endpoint
        await fetch("http://localhost:3001/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
      // Clear the token from localStorage
      localStorage.removeItem("authToken");
      // Redirect to the homepage or login page
      window.location.href = '/'; // This reloads the whole page 
      //navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if the API call fails, clear the token and redirect
      localStorage.removeItem("authToken");
      //navigate("/");
      window.location.href = '/'; // This reloads the whole page 
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/admin">Admin Immobilier</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">
                <FaTachometerAlt className="me-2" />
                Tableau de bord
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/properties">
                <FaHome className="me-2" />
                Propriétés
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/users">
                <FaUsers className="me-2" />
                Utilisateurs
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                <FaCog className="me-2" />
                Paramètres
              </Link>
            </li>
          </ul>
          <button className="btn btn-outline-light" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavbarD;