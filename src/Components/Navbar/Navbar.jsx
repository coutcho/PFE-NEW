import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import io from "socket.io-client";
import "./Navbar.css";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(!!localStorage.getItem("authToken"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const API_INQUIRIES_URL = "http://localhost:3001/api/inquiries";
  const API_USERS_URL = "http://localhost:3001/api/users";
  const socket = io("http://localhost:3001");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (!token) {
        setHasUnreadMessages(false);
        return;
      }
      try {
        const response = await fetch(`${API_INQUIRIES_URL}/user/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch unread count");
        const data = await response.json();
        setHasUnreadMessages(data.unreadCount > 0);
      } catch (err) {
        console.error("Error checking unread messages:", err);
        setHasUnreadMessages(false);
      }
    };

    checkUnreadMessages();

    if (token) {
      fetch(`${API_USERS_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((userData) => {
          socket.emit("join", userData.id);
          socket.on("newMessage", () => {
            checkUnreadMessages();
          });
        });
    }

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (isSignedIn) {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setIsAdmin(decoded.role === "admin");
          setUserRole(decoded.role);
        } catch (error) {
          console.error("Error decoding token:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
      setUserRole(null);
    }
  }, [isSignedIn]);

  const closeModal = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
    setShowForgotPasswordModal(false);
  };

  const handleSignInSuccess = () => {
    setIsSignedIn(true);
    closeModal();
    window.dispatchEvent(new Event("loginSuccess"));

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found in localStorage after login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);

      if (decoded.role === 'expert' || decoded.role === 'agent') {
        navigate('/inbox');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch("http://localhost:3001/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
      localStorage.removeItem("authToken");
      setIsSignedIn(false);
      setIsAdmin(false);
      setUserRole(null);
      setHasUnreadMessages(false);
       window.location.href = '/'; // This reloads the whole page
      //navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
      localStorage.removeItem("authToken");
      setIsSignedIn(false);
      setIsAdmin(false);
      setUserRole(null);
      setHasUnreadMessages(false);
       window.location.href = '/'; // This reloads the whole page
      //navigate('/');

    }
  };

  return (
    <nav
      className={`navbar navbar-expand-lg bg-white ${scrolled ? "scrolled" : ""}`}
      aria-label="Eleventh navbar example"
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="#">
          Darek
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarsExample09"
          aria-controls="navbarsExample09"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarsExample09">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!isSignedIn || (userRole !== 'expert' && userRole !== 'agent' && userRole !== 'admin') ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/">
                  Accueil
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Louer
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/listings?type=appartement&engagement=location"
                      >
                        Appartement
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/listings?type=villa&engagement=location"
                      >
                        Villa
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/listings?type=bureau&engagement=location"
                      >
                        Bureau
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Acheter
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/listings?type=appartement&engagement=achat"
                      >
                        Appartement
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/listings?type=villa&engagement=achat"
                      >
                        Villa
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/listings?type=bureau&engagement=achat"
                      >
                        Bureau
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/home-value">
                    Estimation
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/about-us">
                  À propos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">
                    Contactez-nous
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {isSignedIn ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                      title="Admin Dashboard"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg  "
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-speedometer2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.39.39 0 0 0-.029-.518z"/>
                        <path fillRule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.99 7.99 0 0 1 0 10m8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3"/>
                      </svg>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="dropdown">
                      <button
                        className="btn btn-primary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Mon Compte
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="/profile">
                            Profile
                          </Link>
                        </li>
                        {userRole !== 'expert' && userRole !== 'agent' && (
                          <li>
                            <Link className="dropdown-item" to="/favorites">
                              Mes Favoris
                            </Link>
                          </li>
                        )}
                        <li>
                          <Link className="dropdown-item" to="/inbox">
                            Messages
                            {hasUnreadMessages && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  right: "10px",
                                  transform: "translateY(-50%)",
                                  width: "8px",
                                  height: "8px",
                                  backgroundColor: "red",
                                  borderRadius: "50%",
                                  display: "inline-block",
                                }}
                              />
                            )}
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={handleLogout}
                          >
                            Se déconnecter
                          </button>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowSignInModal(true)}
                >
                  Se connecter
                </button>
                <button
                  className="btn btn-primary signup"
                  onClick={() => setShowSignUpModal(true)}
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showSignInModal && (
        <SignInModal
          show={showSignInModal}
          onClose={closeModal}
          onSignUpClick={() => {
            closeModal();
            setShowSignUpModal(true);
          }}
          onForgotPasswordClick={() => {
            closeModal();
            setShowForgotPasswordModal(true);
          }}
          onSignInSuccess={handleSignInSuccess}
        />
      )}
      {showSignUpModal && (
        <SignUpModal
          show={showSignUpModal}
          onClose={closeModal}
          onSignInClick={() => {
            closeModal();
            setShowSignInModal(true);
          }}
        />
      )}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          show={showForgotPasswordModal}
          onClose={closeModal}
          onBackToSignIn={() => {
            closeModal();
            setShowSignInModal(true);
          }}
        />
      )}
    </nav>
  );
}
