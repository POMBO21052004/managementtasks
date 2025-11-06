import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Alert, 
  Spinner,
  Image
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/Layout";
import EmployeeLayout from "../../layouts/Employe/Layout";
import feather from "feather-icons";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileEdit() {
  const { user: currentUser, isAdmin, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [theme, setTheme] = useState("light");
  const [previewImage, setPreviewImage] = useState(null);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: '',
    profile_picture: null
  });

  // Choisir le layout selon le rôle
  const Layout = isAdmin ? AdminLayout : EmployeeLayout;

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

  // Charger les données du profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/profile");
        const userData = response.data;
        setUser(userData);
        
        // Pré-remplir le formulaire
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          username: userData.username || '',
          profile_picture: null
        });
        
        if (userData.profile_picture) {
          setPreviewImage(userData.profile_picture);
        }
      } catch (err) {
        setError('Erreur lors du chargement du profil');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Remplacer les icônes Feather après le rendu
  useEffect(() => {
    feather.replace();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation du fichier
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 2048 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          profile_picture: 'Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.'
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          profile_picture: 'La taille du fichier ne doit pas dépasser 2MB.'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Effacer l'erreur
      if (errors.profile_picture) {
        setErrors(prev => ({
          ...prev,
          profile_picture: null
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setErrors({});
      
      // Créer FormData pour l'upload de fichier
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'profile_picture') {
          if (formData.profile_picture instanceof File) {
            formDataToSend.append('profile_picture', formData.profile_picture);
          }
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await api.put("/auth/profile/update", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.data) {
        // Mettre à jour le contexte d'authentification
        updateUser(response.data);
        
        // Rediriger vers la page de profil
        navigate('/profile', { 
          state: { 
            message: 'Profil mis à jour avec succès ✅', 
            type: 'success' 
          }
        });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      }
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name, email) => {
    if (name && name.split(' ').length > 1) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email.substring(0, 2).toUpperCase() : 'US';
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement de votre profil...</p>
        </div>
      </Layout>
    );
  }

  if (error && !user) {
    return (
      <Layout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="secondary" as={Link} to="/profile">
            <i data-feather="arrow-left" className="me-2" />
            Retour au profil
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
              Modifier mon profil
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Mise à jour des informations personnelles
            </p>
          </div>
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/profile"
            className="d-flex align-items-center"
          >
            <i data-feather="arrow-left" className="me-2" style={{ width: '16px', height: '16px' }} />
            Annuler
          </Button>
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
                  {/* Photo de profil */}
                  <Row className="mb-4">
                    <Col md={3} className="text-center">
                      <div className="position-relative d-inline-block mb-3">
                        {previewImage ? (
                          <Image
                            src={previewImage}
                            alt="Photo de profil"
                            className="rounded-circle"
                            width="120"
                            height="120"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center border"
                            style={{ width: '120px', height: '120px' }}
                          >
                            <span className="text-primary fw-bold fs-4">
                              {getInitials(user.name || user.username, user.email)}
                            </span>
                          </div>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          className="position-absolute bottom-0 end-0 rounded-circle p-2"
                          style={{ transform: 'translate(25%, 25%)' }}
                          onClick={() => document.getElementById('profileImage').click()}
                        >
                          <i data-feather="camera" style={{ width: '12px', height: '12px' }} />
                        </Button>
                      </div>
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <p className="small text-muted mb-0">
                        JPG, PNG, WEBP - Max 2MB
                      </p>
                      {errors.profile_picture && (
                        <div className="text-danger small mt-1">{errors.profile_picture}</div>
                      )}
                    </Col>
                  </Row>

                  {/* Champs du formulaire */}
                  <Row>
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
                          placeholder="Votre prénom"
                          isInvalid={!!errors.first_name}
                          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.first_name?.[0]}
                        </Form.Control.Feedback>
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
                          placeholder="Votre nom"
                          isInvalid={!!errors.last_name}
                          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.last_name?.[0]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

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
                          placeholder="Votre nom d'utilisateur"
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
                          placeholder="votre@email.com"
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
                          <i data-feather="phone" className="me-2" style={{ width: '16px', height: '16px' }} />
                          Téléphone
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Votre numéro de téléphone"
                          isInvalid={!!errors.phone}
                          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone?.[0]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  {/* Boutons d'action */}
                  <Row>
                    <Col md={12}>
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="outline-secondary"
                          as={Link}
                          to="/profile"
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
                              <Spinner animation="border" size="sm" className="me-2" />
                              Mise à jour...
                            </>
                          ) : (
                            <>
                              {/* <i data-feather="save" className="me-2" style={{ width: '16px', height: '16px' }} /> */}
                              Enregistrer les modifications
                            </>
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Colonne latérale */}
            <Col lg={4}>
              {/* Informations actuelles */}
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
                      <span className="small">Rôle</span>
                      <span className="small fw-bold badge bg-primary">
                        {user.is_admin ? "Administrateur" : "Utilisateur"}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small">Statut</span>
                      <span className={`small fw-bold badge ${user.is_verified ? 'bg-success' : 'bg-warning'}`}>
                        {user.is_verified ? "Vérifié" : "En attente"}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small">Membre depuis</span>
                      <span className="small">
                        {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Aide et conseils */}
              <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="help-circle" className="me-2 text-info" style={{ width: '20px', height: '20px' }} />
                    Conseils
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="small">
                    <div className="d-flex align-items-start mb-2">
                      <i data-feather="user" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }}
                      />
                      <div>
                        <p className="mb-0">Nom : {user.name}</p>
                        <p className="mb-0">Nom d'utilisateur : {user.username}</p>
                        <p className="mb-0">Email : {user.email}</p>
                        <p className="mb-0">Téléphone : {user.phone}</p>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
        </div>
      </Layout>
    );
  }