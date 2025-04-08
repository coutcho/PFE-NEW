import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

function SignInModal({ show, onClose, onSignUpClick, onForgotPasswordClick, onSignInSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "L'email est requis";
    if (!password) newErrors.password = "Le mot de passe est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("http://localhost:3001/api/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, pass: password }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(data.message || "Connexion réussie ! Bienvenue !");
          if (data.token) {
            localStorage.setItem("authToken", data.token);
            const decodedToken = jwtDecode(data.token);
            const userRole = decodedToken.role;

            setEmail("");
            setPassword("");
            setErrors({});
            setServerError("");

            setTimeout(() => {
              if (userRole === "admin") {
                navigate("/admin");
              } else {
                onSignInSuccess();
              }
              onClose();
              setSuccessMessage("");
            }, 2000);
          } else {
            throw new Error("Aucun jeton reçu");
          }
        } else {
          setServerError(data.message || "Une erreur s'est produite lors de la connexion.");
        }
      } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        setServerError("Erreur réseau ou réponse invalide. Veuillez réessayer.");
      }
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:3001/auth/${provider}`;
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Connexion</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Fermer"
              ></button>
            </div>
            <div className="modal-body px-4">
              {successMessage ? (
                <div className="text-center py-4">
                  <div className="alert alert-success">{successMessage}</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {serverError && (
                    <div className="alert alert-danger">{serverError}</div>
                  )}
                  <div className="mb-3">
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="Adresse e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                  <div className="mb-3 text-end">
                    <a
                      href="#"
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onForgotPasswordClick();
                      }}
                    >
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    Se connecter
                  </button>
                  <div className="text-center mb-3">
                    <span className="text-muted">ou connectez-vous avec</span>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={() => handleSocialLogin("google")}
                    >
                      <FaGoogle className="me-2" />
                      Google
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={() => handleSocialLogin("facebook")}
                    >
                      <FaFacebook className="me-2" />
                      Facebook
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="text-muted">Pas de compte ? </span>
                    <a
                      href="#"
                      className="text-primary text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onSignUpClick();
                      }}
                    >
                      Créez-en un
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

export default SignInModal;