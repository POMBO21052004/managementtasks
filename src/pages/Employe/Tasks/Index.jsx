// components/Employee/Tasks/Index.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Dropdown, Modal, Toast, ToastContainer } from "react-bootstrap";
import { Link } from "react-router-dom";
import EmployeLayout from "../../../layouts/Employe/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function EmployeeTaskList() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  
  // Filtres
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  // États pour les modales et toasts
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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

  // Charger les projets pour le filtre
  const fetchProjects = async () => {
    try {
      const response = await api.get("/tasks/projects/");
      setProjects(response.data.results || response.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des projets", err);
    }
  };

  // Charger les tâches
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      if (projectFilter) params.project = projectFilter;

      const response = await api.get("/tasks/tasks/my_tasks/", { params });
      setTasks(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des tâches", err);
      showToastMessage("Erreur lors du chargement des tâches", 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, priorityFilter, statusFilter, projectFilter]);

  useEffect(() => {
    feather.replace();
    fetchTasks();
    fetchProjects();
  }, [fetchTasks]);

  useEffect(() => {
    feather.replace();
  }, [tasks, projects]);

  // Gérer la suppression
  const handleDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await api.delete(`/tasks/tasks/${taskToDelete.id}/`);
      showToastMessage("Tâche supprimée avec succès", 'success');
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
    } catch (err) {
      console.error(err);
      showToastMessage("Erreur lors de la suppression", 'danger');
    }
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  // Marquer comme terminée
  const handleMarkCompleted = async (taskId) => {
    try {
      await api.post(`/tasks/tasks/${taskId}/mark_completed/`);
      showToastMessage("Tâche marquée comme terminée", 'success');
      fetchTasks(); // Recharger la liste
    } catch (err) {
      console.error(err);
      showToastMessage("Erreur lors de la modification", 'danger');
    }
  };

  // Marquer comme non terminée
  const handleMarkIncomplete = async (taskId) => {
    try {
      await api.post(`/tasks/tasks/${taskId}/mark_incomplete/`);
      showToastMessage("Tâche marquée comme non terminée", 'success');
      fetchTasks(); // Recharger la liste
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
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearch("");
    setPriorityFilter("");
    setStatusFilter("");
    setProjectFilter("");
  };

  return (
    <EmployeLayout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
              Mes Tâches
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Gérez toutes vos tâches personnelles
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" as={Link} to="/employe/dashboard">
              <i data-feather="arrow-left" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Dashboard
            </Button>
            <Button variant="outline-primary" as={Link} to="/employee/projects">
              <i data-feather="folder" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Mes Projets
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  Recherche
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par titre ou description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                />
              </Col>
              <Col md={2}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  Priorité
                </Form.Label>
                <Form.Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                >
                  <option value="">Toutes</option>
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  Statut
                </Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                >
                  <option value="">Tous</option>
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="done">Terminée</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  Projet
                </Form.Label>
                <Form.Select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                >
                  <option value="">Tous les projets</option>
                  <option value="none">Sans projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={1}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  &nbsp;
                </Form.Label>
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={fetchTasks}
                >
                  <i data-feather="filter" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                  Filtrer
                </Button>
              </Col>
              <Col md={1}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  &nbsp;
                </Form.Label>
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={resetFilters}
                >
                  <i data-feather="refresh-cw" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                  Réinitialiser
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Statistiques rapides */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center py-3">
                <div className={`h5 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  {tasks.length}
                </div>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  Total
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center py-3">
                <div className="h5 mb-1 text-success">
                  {tasks.filter(task => task.status === 'done').length}
                </div>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  Terminées
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center py-3">
                <div className="h5 mb-1 text-primary">
                  {tasks.filter(task => task.status === 'in_progress').length}
                </div>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  En Cours
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center py-3">
                <div className="h5 mb-1 text-warning">
                  {tasks.filter(task => task.status === 'todo').length}
                </div>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  À Faire
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center py-3">
                <div className="h5 mb-1 text-info">
                  {tasks.filter(task => task.project).length}
                </div>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  Avec Projet
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center py-3">
                <div className="h5 mb-1 text-secondary">
                  {tasks.filter(task => !task.project).length}
                </div>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  Sans Projet
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tableau des tâches */}
        <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
          <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="check-square" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                Mes Tâches ({tasks.length})
              </h5>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                <thead className="table-primary">
                  <tr>
                    <th>Tâche</th>
                    <th className="text-center">Projet</th>
                    <th className="text-center">Priorité</th>
                    <th className="text-center">Statut</th>
                    <th>Échéance</th>
                    <th className="text-center">Créée le</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div>
                          <div className={`fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <small className={theme === "dark" ? "text-light" : "text-muted"}>
                              {task.description.length > 100 
                                ? `${task.description.substring(0, 100)}...` 
                                : task.description}
                            </small>
                          )}
                          {isOverdue(task.due_date, task.status) && (
                            <div>
                              <Badge bg="danger" className="mt-1">
                                <i data-feather="alert-triangle" className="me-1" style={{ width: "10px", height: "10px" }}></i>
                                En retard
                              </Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        {task.project_title ? (
                          <Badge 
                            bg="info" 
                            className="cursor-pointer"
                            as={Link}
                            to={`/employee/projects/${task.project}/tasks`}
                            onClick={(e) => e.stopPropagation()}
                            title={task.project_title}
                          >
                            {task.project_title ? (task.project_title.length > 10 ? task.project_title.substring(0, 10) + "..." : task.project_title) : 'Non spécifié'}
                          </Badge>
                        ) : (
                          <small className="text-muted">Aucun</small>
                        )}
                      </td>
                      <td className="text-center">
                        <Badge bg={getPriorityBadge(task.priority)}>
                          {getPriorityText(task.priority)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg={getStatusBadge(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </td>
                      <td>
                        <small className={theme === "dark" ? "text-light" : "text-muted"}>
                          {formatDate(task.due_date)}
                        </small>
                      </td>
                      <td className="text-center">
                        <small className={theme === "dark" ? "text-light" : "text-muted"}>
                          {formatDate(task.created_at)}
                        </small>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            size="sm"
                            variant="outline-info"
                            as={Link}
                            to={`/employee/tasks/${task.id}`}
                            title="Voir les détails"
                          >
                            <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                          </Button>
                          
                          {/* <Button
                            size="sm"
                            variant="outline-primary"
                            as={Link}
                            to={`/employee/tasks/${task.id}/edit`}
                            title="Modifier"
                          >
                            <i data-feather="edit" style={{ width: "14px", height: "14px" }}></i>
                          </Button> */}

                          {task.status !== 'done' ? (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleMarkCompleted(task.id)}
                              title="Marquer comme terminée"
                            >
                              <i data-feather="check-circle" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleMarkIncomplete(task.id)}
                              title="Marquer comme non terminée"
                            >
                              <i data-feather="x-circle" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                          )}

                          {/* <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowDeleteModal(true);
                            }}
                            title="Supprimer"
                          >
                            <i data-feather="trash-2" style={{ width: "14px", height: "14px" }}></i>
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {tasks.length === 0 && !loading && (
              <div className="text-center py-5">
                <i data-feather="check-square" className="mb-3" style={{ width: "48px", height: "48px", opacity: 0.5 }}></i>
                <h6 className={theme === "dark" ? "text-light" : "text-dark"}>Aucune tâche trouvée</h6>
                <p className={theme === "dark" ? "text-light" : "text-muted"}>
                  {search || priorityFilter || statusFilter || projectFilter
                    ? "Aucune tâche ne correspond à vos critères de recherche." 
                    : "Vous n'avez pas encore de tâches."}
                </p>
                {!(search || priorityFilter || statusFilter || projectFilter) && (
                  <Button variant="primary" as={Link} to="/employee/tasks/create">
                    Créer ma première tâche
                  </Button>
                )}
              </div>
            )}

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement de vos tâches...</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Modal de confirmation de suppression */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
          contentClassName={theme === "dark" ? "bg-dark text-light" : ""}
        >
          <Modal.Header closeButton className={theme === "dark" ? "bg-dark border-secondary" : ""}>
            <Modal.Title>Confirmer la suppression</Modal.Title>
          </Modal.Header>
          <Modal.Body className={theme === "dark" ? "bg-dark" : ""}>
            Êtes-vous sûr de vouloir supprimer la tâche "{taskToDelete?.title}" ? 
            Cette action est irréversible.
          </Modal.Body>
          <Modal.Footer className={theme === "dark" ? "bg-dark border-secondary" : ""}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast de notification */}
        <ToastContainer position="top-end" className="p-3">
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)} 
            delay={5000} 
            autohide
            bg={toastType}
          >
            <Toast.Header className={toastType === 'danger' ? 'bg-danger text-white' : ''}>
              <strong className="me-auto">
                {toastType === 'success' ? 'Succès' : 'Erreur'}
              </strong>
            </Toast.Header>
            <Toast.Body className={toastType === 'danger' ? 'bg-danger text-white' : ''}>
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </EmployeLayout>
  );
}