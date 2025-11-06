// components/Employee/Tasks/Show.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Badge, Alert, Spinner, Modal, Toast, ToastContainer, ProgressBar } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import EmployeLayout from "../../../layouts/Employe/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function EmployeeTaskShow() {
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
        navigate('/employee/tasks');
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
      const response = await api.get(`/tasks/${id}/`);
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
      const response = await api.get(`/tasks/${id}/`);
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
    if (!dueDate || task?.status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <EmployeLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des informations de la tâche...</p>
        </div>
      </EmployeLayout>
    );
  }

  if (error || !task) {
    return (
      <EmployeLayout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error || 'Tâche introuvable'}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="secondary" as={Link} to="/employee/tasks">
            <i data-feather="arrow-left" className="me-2" />
            Retour à la liste
          </Button>
          <Button variant="primary" as={Link} to="/employe/dashboard">
            <i data-feather="home" className="me-2" />
            Dashboard
          </Button>
        </div>
      </EmployeLayout>
    );
  }

  const daysRemaining = getDaysRemaining(task.due_date);
  const isTaskOverdue = isOverdue(task.due_date);

  return (
    <EmployeLayout>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center mb-2">
            <Button 
              variant="outline-secondary" 
              size="sm"
              as={Link} 
              to="/employee/tasks"
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
                {isTaskOverdue && (
                  <Badge bg="danger" className="px-2 py-1">
                    <i data-feather="alert-triangle" className="me-1" style={{ width: '12px', height: '12px' }}></i>
                    En retard
                  </Badge>
                )}
                {task.due_date && !isTaskOverdue && task.status !== 'done' && (
                  <Badge bg={daysRemaining <= 3 ? "warning" : "info"} className="px-2 py-1">
                    <i data-feather="calendar" className="me-1" style={{ width: '12px', height: '12px' }}></i>
                    {daysRemaining === 0 ? "Aujourd'hui" : 
                     daysRemaining === 1 ? "1 jour" : 
                     `${daysRemaining} jours`}
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
              className="d-flex align-items-center"
            >
              <i data-feather="check-circle" className="me-2" style={{ width: '16px', height: '16px' }} />
              Marquer Terminée
            </Button>
          ) : (
            <Button 
              variant="warning"
              onClick={handleMarkIncomplete}
              className="d-flex align-items-center"
            >
              <i data-feather="x-circle" className="me-2" style={{ width: '16px', height: '16px' }} />
              Rouvrir
            </Button>
          )}
          {/* <Button 
            variant="primary" 
            as={Link} 
            to={`/employee/tasks/${id}/edit`}
            className="d-flex align-items-center"
          >
            <i data-feather="edit" className="me-2" style={{ width: '16px', height: '16px' }} />
            Modifier
          </Button> */}
          {/* <Button 
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="d-flex align-items-center"
          >
            <i data-feather="trash-2" className="me-2" style={{ width: '16px', height: '16px' }} />
            Supprimer
          </Button> */}
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
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Statut :</span>
                    <Badge bg={getStatusBadge(task.status)} className="fs-6">
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Priorité :</span>
                    <Badge bg={getPriorityBadge(task.priority)} className="fs-6">
                      {getPriorityText(task.priority)}
                    </Badge>
                  </div>
                </Col>
                {task.project_title && (
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Projet :</span>
                      <div className="text-end">
                        <div className="fw-medium">{task.project_title}</div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          as={Link}
                          to={`/employee/projects/${task.project}/tasks`}
                          className="mt-1"
                        >
                          <i data-feather="folder" className="me-1" style={{ width: '12px', height: '12px' }} />
                          Voir le projet
                        </Button>
                      </div>
                    </div>
                  </Col>
                )}
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Échéance :</span>
                    <span className={`fw-medium ${isTaskOverdue ? 'text-danger' : ''} d-flex align-items-center`}>
                      {task.due_date ? formatDate(task.due_date) : 'Non définie'}
                      {isTaskOverdue && (
                        <i data-feather="alert-triangle" className="ms-1" style={{ width: '14px', height: '14px' }}></i>
                      )}
                    </span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Terminée :</span>
                    <Badge bg={task.is_completed ? 'success' : 'secondary'} className="fs-6">
                      {task.is_completed ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                </Col>
                {task.completed_at && (
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Terminée le :</span>
                      <span className="fw-medium">{formatDate(task.completed_at)}</span>
                    </div>
                  </Col>
                )}
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Créée le :</span>
                    <span className="fw-medium">{formatDate(task.created_at)}</span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Dernière modification :</span>
                    <span className="fw-medium">{formatDate(task.updated_at)}</span>
                  </div>
                </Col>
              </Row>

              {/* Indicateur de progression */}
              {task.due_date && task.status !== 'done' && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Progression vers l'échéance :</span>
                    <span className={`fw-medium ${
                      isTaskOverdue ? 'text-danger' : 
                      daysRemaining <= 3 ? 'text-warning' : 'text-success'
                    }`}>
                      {isTaskOverdue ? 'En retard' : 
                       daysRemaining === 0 ? "Échéance aujourd'hui" :
                       `${daysRemaining} jour(s) restant(s)`}
                    </span>
                  </div>
                  <ProgressBar 
                    now={isTaskOverdue ? 100 : Math.max(0, 100 - (daysRemaining * 5))} 
                    variant={
                      isTaskOverdue ? 'danger' : 
                      daysRemaining <= 3 ? 'warning' : 'success'
                    }
                    style={{ height: '8px' }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Actions rapides */}
          <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="zap" className="me-2" style={{ width: '20px', height: '20px' }} />
                Actions Rapides
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="row g-2">
                <div className="col-md-4">
                  <Button 
                    variant={task.status === 'done' ? 'warning' : 'success'}
                    onClick={task.status === 'done' ? handleMarkIncomplete : handleMarkCompleted}
                    className="w-100 d-flex align-items-center justify-content-center"
                  >
                    <i data-feather={task.status === 'done' ? 'x-circle' : 'check-circle'} className="me-2" style={{ width: '16px', height: '16px' }} />
                    {task.status === 'done' ? 'Rouvrir' : 'Terminer'}
                  </Button>
                </div>
                <div className="col-md-4">
                  <Button 
                    variant="primary"
                    as={Link}
                    to={`/employee/tasks/${id}/edit`}
                    className="w-100 d-flex align-items-center justify-content-center"
                  >
                    <i data-feather="edit" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Modifier
                  </Button>
                </div>
                <div className="col-md-4">
                  <Button 
                    variant="outline-secondary"
                    as={Link}
                    to="/employee/tasks"
                    className="w-100 d-flex align-items-center justify-content-center"
                  >
                    <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Toutes mes tâches
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Projet associé */}
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
                    to={`/employee/projects/${task.project}/tasks`}
                    className="mt-2"
                  >
                    <i data-feather="list" className="me-1" style={{ width: '14px', height: '14px' }} />
                    Voir toutes les tâches du projet
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Statut de la tâche */}
          <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="info" className="me-2 text-primary" style={{ width: '20px', height: '20px' }} />
                Statut de la Tâche
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className={`rounded-circle p-4 d-inline-flex mb-3 ${
                  task.status === 'done' ? 'bg-success' :
                  task.status === 'in_progress' ? 'bg-primary' : 'bg-secondary'
                }`}>
                  <i 
                    data-feather={
                      task.status === 'done' ? 'check-circle' :
                      task.status === 'in_progress' ? 'play-circle' : 'clock'
                    } 
                    className="text-white" 
                    style={{ width: '48px', height: '48px' }} 
                  />
                </div>
                <h4 className={
                  task.status === 'done' ? 'text-success' :
                  task.status === 'in_progress' ? 'text-primary' : 'text-secondary'
                }>
                  {getStatusText(task.status)}
                </h4>
                
                <hr className="my-3" />
                
                <div className="small">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Priorité :</span>
                    <Badge bg={getPriorityBadge(task.priority)}>
                      {getPriorityText(task.priority)}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Terminée :</span>
                    <Badge bg={task.is_completed ? 'success' : 'secondary'}>
                      {task.is_completed ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                  {task.due_date && (
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Échéance :</span>
                      <span className={
                        isTaskOverdue ? 'text-danger fw-bold' : 
                        daysRemaining <= 3 ? 'text-warning' : 'text-muted'
                      }>
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Délai d'échéance */}
          {task.due_date && (
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="calendar" className="me-2 text-info" style={{ width: '20px', height: '20px' }} />
                  Délai d'Échéance
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <div className={`display-4 fw-bold mb-2 ${
                    isTaskOverdue ? 'text-danger' :
                    daysRemaining <= 3 ? 'text-warning' : 'text-success'
                  }`}>
                    {isTaskOverdue ? '!' : daysRemaining}
                  </div>
                  <h6 className={
                    isTaskOverdue ? 'text-danger' :
                    daysRemaining <= 3 ? 'text-warning' : 'text-success'
                  }>
                    {isTaskOverdue ? 'TÂCHE EN RETARD' :
                     daysRemaining === 0 ? "ÉCHÉANCE AUJOURD'HUI" :
                     daysRemaining === 1 ? "JOUR RESTANT" :
                     "JOURS RESTANTS"}
                  </h6>
                  <small className="text-muted">
                    {formatDate(task.due_date)}
                  </small>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Métadonnées */}
          <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="database" className="me-2 text-secondary" style={{ width: '20px', height: '20px' }} />
                Informations Système
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
                {task.completed_at && (
                  <div className="d-flex align-items-start">
                    <i data-feather="check-circle" className="text-success me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                    <div>
                      <div className="fw-medium">Date d'achèvement</div>
                      <div className="text-muted">{formatDate(task.completed_at)}</div>
                    </div>
                  </div>
                )}
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
          <p>Êtes-vous sûr de vouloir supprimer cette tâche ?</p>
          <div className="alert alert-warning">
            <i data-feather="alert-triangle" className="me-2" style={{ width: "16px", height: "16px" }}></i>
            Cette action est irréversible. La tâche "{task.title}" sera définitivement supprimée.
          </div>
        </Modal.Body>
        <Modal.Footer className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
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
    </EmployeLayout>
  );
}