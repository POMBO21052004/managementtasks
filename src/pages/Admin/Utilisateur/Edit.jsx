// AdminUserEdit.jsx
import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Alert, 
  Spinner,
  Modal
} from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [theme, setTheme] = useState("light");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_admin: false,
    is_verified: false
  });
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    password_confirmation: ''
  });

  // Gérer les changements de thème
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme);

    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Charger les données de l'utilisateur
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/auth/admin/users/${id}/`);
        
        const userData = response.data;
        setUser(userData);
        
        // Pré-remplir le formulaire
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          is_admin: userData.is_admin || false,
          is_verified: userData.is_verified || false
        });
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Remplacer les icônes Feather après le rendu
  useEffect(() => {
    feather.replace();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setErrors({});
      
      const response = await api.put(`/auth/admin/users/${id}/`, formData);
      
      if (response.data) {
        // Rediriger vers la liste
        navigate('/admin/users');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!passwordData.password || !passwordData.password_confirmation) {
      setError('Veuillez remplir tous les champs du mot de passe');
      return;
    }
    
    if (passwordData.password !== passwordData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await api.post(`/auth/admin/users/${id}/reset_password/`, {
        new_password: passwordData.password
      });
      
      if (response.data) {
        setShowPasswordModal(false);
        setPasswordData({ password: '', password_confirmation: '' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des données...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !user) {
    return (
      <AdminLayout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="secondary" as={Link} to="/admin/users">
            <i data-feather="arrow-left" className="me-2" />
            Retour à la liste
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center mb-2">
            <Button 
              variant="outline-secondary" 
              size="sm"
              as={Link} 
              to="/admin/users"
              className="me-3"
            >
              <i data-feather="arrow-left" className="me-1" style={{ width: '16px', height: '16px' }} />
              Retour
            </Button>
            <h1 className="h3 mb-0">Modifier l'utilisateur</h1>
          </div>
          <p className="text-muted mb-0">
            Modification des informations de {user?.username}
          </p>
        </div>
      </div>

      {/* Alertes */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Formulaire principal */}
          <Col lg={8} className="mb-4">
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="user" className="me-2" style={{ width: '20px', height: '20px' }} />
                  Informations personnelles
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Champs du formulaire */}
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <i data-feather="user" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Nom d'utilisateur *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Nom d'utilisateur"
                        isInvalid={!!errors.username}
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <i data-feather="mail" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Email *
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="nom@email.com"
                        isInvalid={!!errors.email}
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <i data-feather="user" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Prénom
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Prénom"
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <i data-feather="user" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Nom
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Nom"
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <i data-feather="phone" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Téléphone
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Numéro de téléphone"
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Statuts</Form.Label>
                      <div>
                        <Form.Check
                          type="checkbox"
                          name="is_admin"
                          label="Administrateur"
                          checked={formData.is_admin}
                          onChange={handleInputChange}
                          className={theme === "dark" ? "text-light" : ""}
                        />
                        <Form.Check
                          type="checkbox"
                          name="is_verified"
                          label="Vérifié"
                          checked={formData.is_verified}
                          onChange={handleInputChange}
                          className={theme === "dark" ? "text-light" : ""}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                {/* Boutons d'action */}
                <Row>
                  <Col md={12}>
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="outline-warning"
                        onClick={() => setShowPasswordModal(true)}
                        className="d-flex align-items-center"
                      >
                        <i data-feather="lock" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Changer le mot de passe
                      </Button>
                      
                      <div>
                        <Button
                          variant="outline-secondary"
                          as={Link}
                          to="/admin/users"
                          className="me-2"
                          disabled={saving}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={saving}
                          className="d-flex align-items-center"
                        >
                          {saving ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Mise à jour...
                            </>
                          ) : (
                            <>
                              <i data-feather="save" className="me-2" style={{ width: '16px', height: '16px' }} />
                              Enregistrer les Modifications
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Colonne latérale */}
          <Col lg={4}>
            {/* Informations sur l'utilisateur */}
            {user && (
              <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="info" className="me-2 text-success" style={{ width: '20px', height: '20px' }} />
                    Informations actuelles
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">ID</span>
                    <code className="px-2 py-1 bg-primary bg-opacity-10 rounded text-primary small">
                      {user.id}
                    </code>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">Date de création</span>
                    <span className="small">
                      {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">Dernière connexion</span>
                    <span className="small">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Form>

      {/* Modal de changement de mot de passe */}
      <Modal 
        show={showPasswordModal} 
        onHide={() => setShowPasswordModal(false)} 
        centered
        contentClassName={theme === "dark" ? "bg-dark text-light" : ""}
      >
        <Modal.Header 
          closeButton
          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
        >
          <Modal.Title className="d-flex align-items-center">
            <i data-feather="lock" className="me-2" style={{ width: '20px', height: '20px' }} />
            Changer le mot de passe
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordUpdate}>
          <Modal.Body className={theme === "dark" ? "bg-dark text-light" : ""}>
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                placeholder="Entrez le nouveau mot de passe"
                className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirmer le mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="password_confirmation"
                value={passwordData.password_confirmation}
                onChange={handlePasswordChange}
                placeholder="Confirmez le nouveau mot de passe"
                className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AdminLayout>
  );
}