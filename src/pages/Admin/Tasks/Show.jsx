// components/Admin/TaskShow.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Badge, Alert, Spinner, Modal, Toast, ToastContainer } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function AdminTaskShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
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

  // Charger les données de la tâche
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tasks/tasks/${id}/`);
        setTask(response.data);
      } catch (err) {
        setError('Erreur lors du chargement de la tâche');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  // Remplacer les icônes Feather après le rendu
  useEffect(() => {
    feather.replace();
  }, [task]);

  // Gérer la suppression
  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/tasks/${id}/`);
      showToastMessage("Tâche supprimée avec succès", 'success');
      setTimeout(() => {
        navigate('/admin/tasks');
      }, 1500);
    } catch (err) {
      console.error(err);
      showToastMessage("Erreur lors de la suppression", 'danger');
    }
    setShowDeleteModal(false);
  };

  // Marquer comme terminée
  const handleMarkCompleted = async () => {
    try {
      await api.post(`/tasks/tasks/${id}/mark_completed/`);
      // Recharger les données
      const response = await api.get(`/tasks/tasks/${id}/`);
      setTask(response.data);
      showToastMessage("Tâche marquée comme terminée", 'success');
    } catch (err) {
      console.error(err);
      showToastMessage("Erreur lors de la modification", 'danger');
    }
  };

  // Marquer comme non terminée
  const handleMarkIncomplete = async () => {
    try {
      await api.post(`/tasks/tasks/${id}/mark_incomplete/`);
      // Recharger les données
      const response = await api.get(`/tasks/tasks/${id}/`);
      setTask(response.data);
      showToastMessage("Tâche marquée comme non terminée", 'success');
    } catch (err) {
      console.error(err);
      showToastMessage("Erreur lors de la modification", 'danger');
    }
  };

  // Fonctions utilitaires
  const getPriorityBadge = (priority) => {
    const variants = {
      'high': 'danger',
      'medium': 'warning',
      'low': 'success'
    };
    return variants[priority] || 'secondary';
  };

  const getStatusBadge = (status) => {
    const variants = {
      'done': 'success',
      'in_progress': 'primary',
      'todo': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getPriorityText = (priority) => {
    const texts = {
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    };
    return texts[priority] || priority;
  };

  const getStatusText = (status) => {
    const texts = {
      'done': 'Terminée',
      'in_progress': 'En cours',
      'todo': 'À faire'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task?.status !== 'done';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des informations de la tâche...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !task) {
    return (
      <AdminLayout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error || 'Tâche introuvable'}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="secondary" as={Link} to="/admin/tasks">
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
              to="/admin/tasks"
              className="me-3"
            >
              <i data-feather="arrow-left" className="me-1" style={{ width: '16px', height: '16px' }} />
              Retour
            </Button>
            <div>
              <h1 className={`h3 mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                {task.title}
              </h1>
              <div className="d-flex align-items-center gap-2 mt-1">
                <Badge bg={getPriorityBadge(task.priority)} className="px-2 py-1">
                  <i data-feather="flag" className="me-1" style={{ width: '12px', height: '12px' }}></i>
                  {getPriorityText(task.priority)}
                </Badge>
                <Badge bg={getStatusBadge(task.status)} className="px-2 py-1">
                  <i data-feather={task.status === 'done' ? 'check-circle' : 'clock'} className="me-1" style={{ width: '12px', height: '12px' }}></i>
                  {getStatusText(task.status)}
                </Badge>
                {isOverdue(task.due_date) && (
                  <Badge bg="danger" className="px-2 py-1">
                    <i data-feather="alert-triangle" className="me-1" style={{ width: '12px', height: '12px' }}></i>
                    En retard
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          {task.status !== 'done' ? (
            <Button 
              variant="success" 
              onClick={handleMarkCompleted}
            >
              <i data-feather="check-circle" className="me-2" style={{ width: '16px', height: '16px' }} />
              Marquer Terminée
            </Button>
          ) : (
            <Button 
              variant="warning"
              onClick={handleMarkIncomplete}
            >
              <i data-feather="x-circle" className="me-2" style={{ width: '16px', height: '16px' }} />
              Marquer Non Terminée
            </Button>
          )}
          <Button 
            variant="primary" 
            as={Link} 
            to={`/admin/tasks/${id}/edit`}
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
          {/* Détails de la tâche */}
          <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="file-text" className="me-2" style={{ width: '20px', height: '20px' }} />
                Détails de la tâche
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={12}>
                  <h4 className="mb-3">{task.title}</h4>
                  {task.description ? (
                    <div className={`p-3 rounded ${theme === "dark" ? "bg-dark border" : "bg-light"}`}>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {task.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted fst-italic">Aucune description fournie</p>
                  )}
                </Col>
              </Row>

              <hr className="my-4" />

              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Statut :</span>
                    <Badge bg={getStatusBadge(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Priorité :</span>
                    <Badge bg={getPriorityBadge(task.priority)}>
                      {getPriorityText(task.priority)}
                    </Badge>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Échéance :</span>
                    <span className={`fw-medium ${isOverdue(task.due_date) ? 'text-danger' : ''}`}>
                      {task.due_date ? formatDate(task.due_date) : 'Non définie'}
                      {isOverdue(task.due_date) && (
                        <i data-feather="alert-triangle" className="ms-1" style={{ width: '14px', height: '14px' }}></i>
                      )}
                    </span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Terminée :</span>
                    <Badge bg={task.is_completed ? 'success' : 'secondary'}>
                      {task.is_completed ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                </Col>
                {task.completed_at && (
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Terminée le :</span>
                      <span className="fw-medium">{formatDate(task.completed_at)}</span>
                    </div>
                  </Col>
                )}
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Créée le :</span>
                    <span className="fw-medium">{formatDate(task.created_at)}</span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Dernière modification :</span>
                    <span className="fw-medium">{formatDate(task.updated_at)}</span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
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
                    <div className="fw-medium">ID Tâche</div>
                    <div className="text-muted">{task.id}</div>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <i data-feather="calendar" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">Date de création</div>
                    <div className="text-muted">{formatDate(task.created_at)}</div>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <i data-feather="clock" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">Dernière modification</div>
                    <div className="text-muted">{formatDate(task.updated_at)}</div>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <i data-feather="user" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">ID Utilisateur</div>
                    <div className="text-muted">{task.user}</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Row>
          <Col md={4} className="mb-3">
            {task.project && (
              <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className="border-0">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="folder" className="me-2" style={{ width: '20px', height: '20px' }} />
                    Projet associé
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                      <i data-feather="folder" className="text-primary" style={{ width: '32px', height: '32px' }} />
                    </div>
                    <h6 className="mb-1">{task.project_title}</h6>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      as={Link}
                      to={`/admin/projects/${task.project}/tasks`}
                      className="mt-2"
                    >
                      <i data-feather="list" className="me-1" style={{ width: '14px', height: '14px' }} />
                      Voir toutes les tâches du projet
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
          <Col md={4} className="mb-3">
            {/* Informations utilisateur */}
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="user" className="me-2" style={{ width: '20px', height: '20px' }} />
                  Assignée à
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i data-feather="user" className="text-primary" style={{ width: '32px', height: '32px' }} />
                  </div>
                  <h6 className="mb-1">{task.user_name || task.user_email}</h6>
                  <p className="text-muted mb-2">{task.user_email}</p>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    as={Link}
                    to={`/admin/users/${task.user}`}
                  >
                    <i data-feather="eye" className="me-1" style={{ width: '14px', height: '14px' }} />
                    Voir le profil
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
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
                {task.status !== 'done' ? (
                  <Button 
                    variant="success" 
                    onClick={handleMarkCompleted}
                  >
                    <i data-feather="check-circle" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Marquer comme terminée
                  </Button>
                ) : (
                  <Button 
                    variant="warning"
                    onClick={handleMarkIncomplete}
                  >
                    <i data-feather="x-circle" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Marquer comme non terminée
                  </Button>
                )}
                <Button 
                  variant="primary"
                  as={Link}
                  to={`/admin/tasks/${id}/edit`}
                >
                  <i data-feather="edit" className="me-2" style={{ width: '16px', height: '16px' }} />
                  Modifier la tâche
                </Button>
                <Button 
                  variant="outline-info" 
                  as={Link} 
                  to="/admin/tasks"
                >
                  <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                  Toutes les tâches
                </Button>
              </div>
            </Card.Body>
          </Card>
          </Col>
        </Row>
          
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
          <p>Êtes-vous sûr de vouloir supprimer cette tâche ?</p>
          <div className="alert alert-warning">
            <i data-feather="alert-triangle" className="me-2" style={{ width: "16px", height: "16px" }}></i>
            Cette action est irréversible. La tâche "{task.title}" sera définitivement supprimée.
          </div>
          <div className="alert alert-info">
            <i data-feather="info" className="me-2" style={{ width: "16px", height: "16px" }}></i>
            <strong>Utilisateur :</strong> {task.user_name || task.user_email}
          </div>
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