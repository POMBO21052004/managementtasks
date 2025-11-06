// AdminUserShow.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Badge, Alert, Spinner, Modal, Toast, ToastContainer } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function AdminUserShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("light");

  // États Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modal pour confirmation suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Afficher les notifications toast
  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Charger les données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/auth/admin/users/${id}/`);
        setUser(response.data);
      } catch (err) {
        setError('Erreur lors du chargement de l\'utilisateur');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  // Remplacer les icônes Feather après le rendu
  useEffect(() => {
    feather.replace();
  }, [user]);

  // Gérer la suppression
  const handleDelete = async () => {
    try {
      await api.delete(`/auth/admin/users/${id}/`);
      showToastMessage("Utilisateur supprimé avec succès", 'success');
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err) {
      console.error(err);
      showToastMessage(err.response?.data?.error || "Erreur lors de la suppression", 'danger');
    }
    setShowDeleteModal(false);
  };

  // Toggle statut admin
  const handleToggleAdmin = async () => {
    try {
      await api.post(`/auth/admin/users/${id}/toggle_admin/`);
      // Recharger les données
      const response = await api.get(`/auth/admin/users/${id}/`);
      setUser(response.data);
      showToastMessage(
        response.data.is_admin ? "Utilisateur promu administrateur" : "Utilisateur rétrogradé",
        'success'
      );
    } catch (err) {
      console.error(err);
      showToastMessage(err.response?.data?.error || "Erreur lors de la modification", 'danger');
    }
  };

  // Toggle statut vérifié
  const handleToggleVerified = async () => {
    try {
      await api.post(`/auth/admin/users/${id}/toggle_verified/`);
      // Recharger les données
      const response = await api.get(`/auth/admin/users/${id}/`);
      setUser(response.data);
      showToastMessage(
        response.data.is_verified ? "Utilisateur vérifié" : "Utilisateur non vérifié",
        'success'
      );
    } catch (err) {
      console.error(err);
      showToastMessage("Erreur lors de la modification", 'danger');
    }
  };

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des informations de l'utilisateur...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error || 'Utilisateur introuvable'}
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
            <div>
              <h1 className={`h3 mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                {user.username}
              </h1>
              <div className="d-flex align-items-center gap-2 mt-1">
                <small className="text-muted">ID: {user.id}</small>
                <Badge bg={user.is_admin ? "success" : "info"} className="px-2 py-1">
                  <i data-feather={user.is_admin ? "shield" : "user"} className="me-1" style={{ width: '12px', height: '12px' }}></i>
                  {user.is_admin ? "Administrateur" : "Utilisateur"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            as={Link} 
            to={`/admin/users/${id}/edit`}
          >
            <i data-feather="edit" className="me-2" style={{ width: '16px', height: '16px' }} />
            Modifier
          </Button>
          <Button 
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <i data-feather="trash-2" className="me-2" style={{ width: '16px', height: '16px' }} />
            Supprimer
          </Button>
        </div>
      </div>

      <Row>
        {/* Informations principales */}
        <Col lg={8}>
          {/* Profil de l'utilisateur */}
          <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="user" className="me-2" style={{ width: '20px', height: '20px' }} />
                Profil de l'utilisateur
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
                      <i data-feather="user" className="text-primary" style={{ width: '48px', height: '48px' }} />
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
                  <h4 className="mb-2">{user.username}</h4>
                  {user.first_name && user.last_name && (
                    <p className="text-muted mb-2">
                      <i data-feather="user-check" className="me-2" style={{ width: '16px', height: '16px' }} />
                      {user.first_name} {user.last_name}
                    </p>
                  )}
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
                    <Badge 
                      bg={user.is_admin ? "success" : "secondary"} 
                      className="cursor-pointer"
                      onClick={handleToggleAdmin}
                      title="Cliquer pour changer le statut admin"
                    >
                      <i data-feather={user.is_admin ? "shield" : "user"} className="me-1" style={{ width: '12px', height: '12px' }} />
                      {user.is_admin ? "Administrateur" : "Utilisateur"}
                    </Badge>
                    <Badge 
                      bg={user.is_verified ? "warning" : "secondary"} 
                      className="cursor-pointer"
                      onClick={handleToggleVerified}
                      title="Cliquer pour changer le statut vérifié"
                    >
                      <i data-feather={user.is_verified ? "check-circle" : "x-circle"} className="me-1" style={{ width: '12px', height: '12px' }} />
                      {user.is_verified ? "Vérifié" : "Non vérifié"}
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
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Statut admin :</span>
                    <Badge bg={user.is_admin ? "success" : "secondary"}>
                      {user.is_admin ? "Oui" : "Non"}
                    </Badge>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Compte vérifié :</span>
                    <Badge bg={user.is_verified ? "success" : "secondary"}>
                      {user.is_verified ? "Oui" : "Non"}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Activités récentes */}
          <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="activity" className="me-2" style={{ width: '20px', height: '20px' }} />
                Activités et permissions
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i data-feather={user.is_admin ? "shield" : "user"} className="text-primary me-3" style={{ width: '18px', height: '18px' }}></i>
                    <div>
                      <div className="fw-bold">Niveau d'accès</div>
                      <small className="text-muted">
                        {user.is_admin ? "Accès administrateur complet" : "Accès utilisateur standard"}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i data-feather={user.is_verified ? "check-circle" : "x-circle"} className={user.is_verified ? "text-success me-3" : "text-danger me-3"} style={{ width: '18px', height: '18px' }}></i>
                    <div>
                      <div className="fw-bold">Statut du compte</div>
                      <small className="text-muted">
                        {user.is_verified ? "Compte vérifié et actif" : "Compte en attente de vérification"}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i data-feather="calendar" className="text-info me-3" style={{ width: '18px', height: '18px' }}></i>
                    <div>
                      <div className="fw-bold">Ancienneté</div>
                      <small className="text-muted">
                        Membre depuis {formatDate(user.date_joined)}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i data-feather="clock" className="text-warning me-3" style={{ width: '18px', height: '18px' }}></i>
                    <div>
                      <div className="fw-bold">Dernière activité</div>
                      <small className="text-muted">
                        {user.last_login ? formatDate(user.last_login) : "Aucune activité"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Actions rapides */}
          <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="settings" className="me-2" style={{ width: '20px', height: '20px' }} />
                Actions rapides
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary"
                  as={Link}
                  to={`/admin/users/${id}/edit`}
                >
                  <i data-feather="edit-2" className="me-2" style={{ width: '18px', height: '18px' }} />
                  Modifier le profil
                </Button>
                <Button 
                  variant={user.is_admin ? "warning" : "success"}
                  onClick={handleToggleAdmin}
                >
                  <i data-feather={user.is_admin ? "user" : "shield"} className="me-2" style={{ width: '18px', height: '18px' }} />
                  {user.is_admin ? "Rétrograder" : "Promouvoir Admin"}
                </Button>
                <Button 
                  variant={user.is_verified ? "warning" : "success"}
                  onClick={handleToggleVerified}
                >
                  <i data-feather={user.is_verified ? "x-circle" : "check-circle"} className="me-2" style={{ width: '18px', height: '18px' }} />
                  {user.is_verified ? "Désactiver" : "Activer Vérification"}
                </Button>
                <Button 
                  variant="outline-info" 
                  as={Link} 
                  to="/admin/users"
                >
                  <i data-feather="list" className="me-2" style={{ width: '18px', height: '18px' }} />
                  Tous les utilisateurs
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Statut du compte */}
          <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="bar-chart" className="me-2" style={{ width: '20px', height: '20px' }} />
                Statut du compte
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div className={user.is_admin ? "text-success mb-2" : "text-info mb-2"}>
                  <i data-feather={user.is_admin ? "shield" : "user"} style={{ width: '32px', height: '32px' }} />
                </div>
                <h6 className="mb-0">Type de compte</h6>
                <h4 className={user.is_admin ? "text-success mb-0" : "text-info mb-0"}>
                  {user.is_admin ? "Administrateur" : "Utilisateur"}
                </h4>
                <small className="text-muted">
                  {user.is_admin ? "Accès complet au système" : "Accès utilisateur standard"}
                </small>
              </div>
              
              <hr className="my-3" />
              
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Profil complété :</span>
                  <span className="fw-bold text-success">
                    {user.username && user.email ? '100%' : 
                     user.username ? '75%' : '50%'}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Dernière connexion :</span>
                  <span>{user.last_login ? formatDate(user.last_login) : 'Jamais'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Compte vérifié :</span>
                  <Badge bg={user.is_verified ? "success" : "secondary"}>
                    {user.is_verified ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Statut :</span>
                  <Badge bg={user.is_active ? "success" : "danger"}>
                    {user.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Informations système */}
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
                    <div className="fw-medium">Date de création</div>
                    <div className="text-muted">{formatDate(user.date_joined)}</div>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <i data-feather="clock" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">Dernière modification</div>
                    <div className="text-muted">{formatDate(user.updated_at)}</div>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <i data-feather="shield" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">Niveau d'accès</div>
                    <div className="text-muted">
                      {user.is_admin ? "Administrateur - Accès complet" : "Utilisateur - Accès limité"}
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmation de suppression */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName={theme === "dark" ? "bg-dark text-light" : ""}
      >
        <Modal.Header className={theme === "dark" ? "bg-dark text-light border-secondary" : ""} closeButton>
          <Modal.Title>Confirmation de Suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === "dark" ? "bg-dark text-light" : ""}>
          <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
          <div className="alert alert-warning">
            <i data-feather="alert-triangle" className="me-2" style={{ width: "16px", height: "16px" }}></i>
            Cette action est irréversible. L'utilisateur "{user.username}" sera définitivement supprimé du système.
          </div>
          {user.is_admin && (
            <div className="alert alert-danger">
              <i data-feather="alert-octagon" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              <strong>Attention :</strong> Cet utilisateur est un administrateur. Sa suppression peut affecter le fonctionnement du système.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete}>
            <i data-feather="trash-2" className="me-2" style={{ width: "16px", height: "16px" }}></i>
            Supprimer définitivement
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notifications Toast */}
      <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1050 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastType === 'success' ? 'success' : 'danger'}
          className={theme === "dark" ? "text-light" : "text-white"}
        >
          <Toast.Header
            closeButton={false}
            className={`${toastType === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}
          >
            <strong className="me-auto">
              <i data-feather={toastType === 'success' ? 'check-circle' : 'x-circle'} className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Notification
            </strong>
          </Toast.Header>
          <Toast.Body className={theme === "dark" ? "bg-dark text-light" : ""}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </AdminLayout>
  );
}