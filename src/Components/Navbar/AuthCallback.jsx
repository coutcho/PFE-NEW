import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      // Redirect based on role
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      // If no token, redirect to home or sign-in page
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return <div>Processing login...</div>; // Temporary UI while redirecting
}

export default AuthCallback;