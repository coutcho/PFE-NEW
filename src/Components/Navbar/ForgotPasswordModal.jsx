import { useState } from "react";

function ForgotPasswordModal({ show, onClose, onBackToSignIn }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) =>
    String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("L'email est requis");
      return;
    }
    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true); // Show success UI
      } else {
        setError(data.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setError("Erreur réseau. Veuillez vérifier votre connexion et réessayer.");
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Réinitialiser le mot de passe</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Fermer"
              ></button>
            </div>
            <div className="modal-body px-4">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <p className="text-muted">
                      Entrez votre adresse email et nous vous enverrons des instructions pour
                      réinitialiser votre mot de passe.
                    </p>
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className={`form-control ${error ? "is-invalid" : ""}`}
                      placeholder="Adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {error && <div className="invalid-feedback">{error}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    Continuer
                  </button>
                  <div className="text-center">
                    <a
                      href="#"
                      className="text-primary text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onBackToSignIn();
                      }}
                    >
                      Retour à la connexion
                    </a>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <svg
                      className="text-success"
                      width="64"
                      height="64"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                    </svg>
                  </div>
                  <h5 className="mb-3">Vérifiez votre email</h5>
                  <p className="text-muted mb-4">
                    Nous avons envoyé les instructions de réinitialisation du mot de passe à :<br />
                    <strong>{email}</strong>
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={onBackToSignIn}
                  >
                    Retour à la connexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}

export default ForgotPasswordModal;