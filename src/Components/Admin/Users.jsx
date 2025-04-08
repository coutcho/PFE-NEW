import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Users() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:3001/api/users';
  const token = localStorage.getItem('authToken');

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError('Veuillez vous connecter en tant qu\'administrateur pour voir les utilisateurs');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_BASE_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Échec de l\'authentification ou accès administrateur requis. Veuillez vous connecter en tant qu\'administrateur.');
          }
          throw new Error('Échec du chargement des utilisateurs');
        }
        const data = await response.json();
        const filteredUsers = data.filter(user => ['admin', 'expert', 'agent'].includes(user.role));
        setUsers(filteredUsers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Veuillez vous connecter en tant qu\'administrateur pour ajouter ou modifier des utilisateurs');
      return;
    }

    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      joinDate: formData.get('joinDate') || new Date().toISOString().split('T')[0],
      password: formData.get('password'), // Envoyer le mot de passe pour l'ajout et l'édition (optionnel pour l'édition)
    };

    try {
      let response;
      if (editingUser) {
        response = await fetch(`${API_BASE_URL}/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      } else {
        if (!userData.password) {
          throw new Error('Le mot de passe est requis pour les nouveaux utilisateurs');
        }
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          throw new Error('Échec de l\'authentification ou accès administrateur requis. Veuillez vous connecter en tant qu\'administrateur.');
        }
        throw new Error(errorData.message || (editingUser ? 'Échec de la mise à jour de l\'utilisateur' : 'Échec de l\'ajout de l\'utilisateur'));
      }
      const savedUser = await response.json();

      if (editingUser) {
        setUsers(users.map(u => (u.id === editingUser.id ? savedUser : u)));
        setEditingUser(null);
      } else {
        if (['admin', 'expert', 'agent'].includes(savedUser.role)) {
          setUsers([...users, savedUser]);
        }
      }
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!token) {
      setError('Veuillez vous connecter en tant qu\'administrateur pour supprimer des utilisateurs');
      return;
    }

    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Échec de l\'authentification ou accès administrateur requis. Veuillez vous connecter en tant qu\'administrateur.');
          }
          throw new Error('Échec de la suppression de l\'utilisateur');
        }
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'expert':
        return 'primary';
      case 'agent':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (!token) return <div>Veuillez vous connecter en tant qu\'administrateur pour gérer les utilisateurs.</div>;
  if (loading) return <div>Chargement des utilisateurs...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4">Utilisateurs</h1>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">
                {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    defaultValue={editingUser?.name}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    defaultValue={editingUser?.email}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    {editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    required={!editingUser} // Requis uniquement pour les nouveaux utilisateurs
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Numéro de téléphone</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    defaultValue={editingUser?.phone}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Rôle</label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    defaultValue={editingUser?.role || ''}
                    required
                  >
                    <option value="">Sélectionner un rôle...</option>
                    <option value="admin">Admin</option>
                    <option value="expert">Expert</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="joinDate" className="form-label">Date d'adhésion</label>
                  <input
                    type="date"
                    className="form-control"
                    id="joinDate"
                    name="joinDate"
                    defaultValue={editingUser?.joinDate}
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Mettre à jour l\'utilisateur' : 'Ajouter l\'utilisateur'}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingUser(null)}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Liste des utilisateurs</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge bg-${getRoleBadgeColor(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEdit(user)}
                          >
                            <FaEdit /> Modifier
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(user.id)}
                          >
                            <FaTrash /> Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;