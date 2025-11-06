import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Badge, Alert, Spinner, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

export default function ProfileShow() {
  const { user: currentUser, isAdmin } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("light");

  // Choisir le layout selon le rôle
  const Layout = AdminLayout;

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
        setUser(response.data);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (error || !user) {
    return (
      <Layout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error || 'Profil introuvable'}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="secondary" as={Link} to={isAdmin ? "/admin/dashboard" : "/employee/dashboard"}>
            <i data-feather="arrow-left" className="me-2" />
            Retour au dashboard
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
              Mon Profil
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Informations personnelles et compte
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              as={Link} 
              to={isAdmin ? "/admin/dashboard" : "/employee/dashboard"}
              className="d-flex align-items-center"
            >
              <i data-feather="arrow-left" className="me-2" style={{ width: '16px', height: '16px' }} />
              Retour
            </Button>
            {/* <Button 
              variant="primary" 
              as={Link} 
              to="/profile/edit"
              className="d-flex align-items-center"
            >
              <i data-feather="edit" className="me-2" style={{ width: '16px', height: '16px' }} />
              Modifier
            </Button> */}
          </div>
        </div>

        <Row>
          {/* Informations principales */}
          <Col lg={8}>
            {/* Carte de profil */}
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="user" className="me-2" style={{ width: '20px', height: '20px' }} />
                  Informations personnelles
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="align-items-center mb-4">
                  <Col md={3} className="text-center">
                    <div className="position-relative d-inline-block">
                      
                      <div 
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center border"
                        style={{ width: '120px', height: '120px' }}
                      >
                        <span className="text-primary fw-bold fs-4">
                          {getInitials(user.name || user.username, user.email)}
                        </span>
                      </div>

                      <Badge 
                        bg={user.is_admin ? "success" : "info"} 
                        className="position-absolute bottom-0 end-0 rounded-circle p-2"
                        style={{ transform: 'translate(25%, 25%)' }}
                      >
                        <i data-feather={user.is_admin ? "shield" : "user"} style={{ width: '12px', height: '12px' }} />
                      </Badge>
                    </div>
                  </Col>
                  <Col md={9}>
                    <h4 className="mb-2">{user.name || user.username}</h4>
                    <p className="text-muted mb-2">
                      <i data-feather="mail" className="me-2" style={{ width: '16px', height: '16px' }} />
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-muted mb-2">
                        <i data-feather="phone" className="me-2" style={{ width: '16px', height: '16px' }} />
                        {user.phone}
                      </p>
                    )}
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <Badge bg={user.is_admin ? "success" : "primary"}>
                        <i data-feather={user.is_admin ? "shield" : "user"} className="me-1" style={{ width: '12px', height: '12px' }} />
                        {user.is_admin ? "Administrateur" : "Utilisateur"}
                      </Badge>
                      <Badge bg={user.is_verified ? "success" : "secondary"}>
                        <i data-feather={user.is_verified ? "check-circle" : "x-circle"} className="me-1" style={{ width: '12px', height: '12px' }} />
                        {user.is_verified ? "Vérifié" : "Non vérifié"}
                      </Badge>
                      <Badge bg={user.is_active ? "success" : "danger"}>
                        {user.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </Col>
                </Row>

                <hr className="my-4" />

                <Row>
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Nom d'utilisateur :</span>
                      <span className="fw-medium">{user.username}</span>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Email :</span>
                      <span className="fw-medium">{user.email}</span>
                    </div>
                  </Col>
                  {user.first_name && (
                    <Col md={6} className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Prénom :</span>
                        <span className="fw-medium">{user.first_name}</span>
                      </div>
                    </Col>
                  )}
                  {user.last_name && (
                    <Col md={6} className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Nom :</span>
                        <span className="fw-medium">{user.last_name}</span>
                      </div>
                    </Col>
                  )}
                  {user.phone && (
                    <Col md={6} className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Téléphone :</span>
                        <span className="fw-medium">{user.phone}</span>
                      </div>
                    </Col>
                  )}
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Inscrit depuis :</span>
                      <span className="fw-medium">{formatDate(user.date_joined)}</span>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Dernière connexion :</span>
                      <span className="fw-medium">
                        {user.last_login ? formatDate(user.last_login) : 'Jamais connecté'}
                      </span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Statistiques personnelles */}
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="bar-chart" className="me-2" style={{ width: '20px', height: '20px' }} />
                  Mes statistiques
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="text-center">
                  <Col md={4}>
                    <div className="border-end border-secondary">
                      <div className={`h4 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        {user.total_tasks || 0}
                      </div>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>Tâches totales</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="border-end border-secondary">
                      <div className="h4 mb-1 text-success">
                        {user.completed_tasks || 0}
                      </div>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>Tâches terminées</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className={`h4 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                      {user.pending_tasks || 0}
                    </div>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>Tâches en cours</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Actions rapides */}
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="zap" className="me-2" style={{ width: '20px', height: '20px' }} />
                  Actions rapides
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-info" 
                    as={Link} 
                    to={"/admin/tasks"}
                  >
                    <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Tâches
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Informations du compte */}
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="shield" className="me-2 text-success" style={{ width: '20px', height: '20px' }} />
                  Statut du compte
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  <div className={user.is_admin ? "text-success mb-2" : "text-primary mb-2"}>
                    <i data-feather={user.is_admin ? "shield" : "user"} style={{ width: '32px', height: '32px' }} />
                  </div>
                  <h6 className="mb-0">Type de compte</h6>
                  <h4 className={user.is_admin ? "text-success mb-0" : "text-primary mb-0"}>
                    {user.is_admin ? "Administrateur" : "Utilisateur"}
                  </h4>
                </div>
                
                <hr className="my-3" />
                
                <div className="small">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Vérification :</span>
                    <Badge bg={user.is_verified ? "success" : "secondary"}>
                      {user.is_verified ? "Vérifié" : "En attente"}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Activité :</span>
                    <Badge bg={user.is_active ? "success" : "danger"}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Membre depuis :</span>
                    <span>{new Date(user.date_joined).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Métadonnées */}
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="info" className="me-2 text-secondary" style={{ width: '20px', height: '20px' }} />
                  Informations système
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="small">
                  <div className="d-flex align-items-start mb-3">
                    <i data-feather="hash" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                    <div>
                      <div className="fw-medium">ID Utilisateur</div>
                      <div className="text-muted">{user.id}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-start mb-3">
                    <i data-feather="calendar" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                    <div>
                      <div className="fw-medium">Dernière mise à jour</div>
                      <div className="text-muted">{formatDate(user.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}