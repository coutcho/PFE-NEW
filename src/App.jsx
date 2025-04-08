import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { FavoritesProvider } from './Components/Body/FavoritesContext';
import Navbar from './Components/Navbar/Navbar';
import SearchBar from './Components/Navbar/Searchbar';
import AuthCallback from './Components/Navbar/AuthCallback';
import Chat from './Components/Chat/Chat';
import Profile from './Components/Navbar/Profile';
import FavoritesPage from './Components/Navbar/FavoritesListings';
import Contact from './Components/Navbar/Contact';
import HomeValue from './Components/Navbar/HomeValue';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PropertyListings from './Components/Body/PropertyListings';
import NewestListings from './Components/Body/NewestListings';
import AllListings from './Components/Body/AllListings';
import Footer from './Components/Footer/Footer';
import ListingPage from './Components/ListingPage/ListingPage';
import ResetPasswordModal from './Components/Navbar/ResetPasswordModal';
import AdminPage from "./Components/Admin/AdminPage";
import Annonces from './Components/Body/Annonces';
import Aboutus from './Components/Body/Aboutus';

// AuthenticatedRoute
function AuthenticatedRoute({ children }) {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/" replace />;
  try {
    jwtDecode(token);
    return children;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("authToken");
    return <Navigate to="/" replace />;
  }
}

// PrivateRoute
function PrivateRoute({ children }) {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/" replace />;
  try {
    const { role } = jwtDecode(token);
    return role === "admin" ? children : <Navigate to="/" replace />;
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("authToken");
    return <Navigate to="/" replace />;
  }
}

// Layout component
function Layout({ children, onSignInTrigger }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdminRoute && <Navbar onSignInTrigger={onSignInTrigger} />}
      {children}
    </>
  );
}

// Main App component
export default function App() {
  const [openSignIn, setOpenSignIn] = useState(null);

  return (
    <FavoritesProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <div className="min-h-screen flex flex-col justify-center items-center text-center">
                  <main className="w-full max-w-7xl p-4">
                    <h1 className="text-4xl font-bold mb-6">Rechercher où habiter!</h1>
                  </main>
                  <SearchBar />
                </div>
                <div className="bg-light bg-gray-100">
                  <NewestListings />
                  <div className="bg-white">
                    <PropertyListings />
                  </div>
                  <Annonces />
                </div>
                <Footer />
              </Layout>
            }
          />
          <Route
            path="/listings"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <AllListings />
              </Layout>
            }
          />
          <Route
            path="/listing/:id"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <ListingPage />
              </Layout>
            }
          />
          <Route
            path="/favorites"
            element={
              <AuthenticatedRoute>
                <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                  <FavoritesPage />
                  <Footer />
                </Layout>
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <Chat />
                <Footer />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <Profile />
                <Footer />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <Contact />
                <Footer />
              </Layout>
            }
          />
          <Route
            path="/home-value"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <HomeValue />
                <Footer />
              </Layout>
            }
          />
          <Route
            path="/about-us"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <Aboutus />
                <Footer />
              </Layout>
            }
          />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <ResetPasswordModal
                  show={true}
                  onClose={() => window.history.pushState({}, "", "/")}
                  onSignInClick={() => {
                    if (openSignIn) openSignIn();
                  }}
                />
              </Layout>
            }
          />
          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />
          <Route
            path="*"
            element={
              <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
                <Navigate to="/" replace />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </FavoritesProvider>
  );
}