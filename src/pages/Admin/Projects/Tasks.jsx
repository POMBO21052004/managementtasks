import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Dropdown, Alert, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function AdminProjectTasks() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState(null);
  
  // Filtres
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  // Charger le projet et ses tâches
  const fetchProjectTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger les informations du projet
      const projectResponse = await api.get(`/tasks/projects/${id}/`);
      setProject(projectResponse.data);
      
      // Charger les tâches avec filtres
      const params = { project: id };
      if (search) params.search = search;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;

      const tasksResponse = await api.get("/tasks/tasks/", { params });
      setTasks(tasksResponse.data.results || tasksResponse.data || []);
      
    } catch (err) {
      console.error("Erreur lors du chargement des données", err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [id, search, priorityFilter, statusFilter]);

  useEffect(() => {
    feather.replace();
    fetchProjectTasks();
  }, [fetchProjectTasks]);

  useEffect(() => {
    feather.replace();
  }, [tasks, project]);

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

  const calculateCompletionRate = () => {
    if (!tasks.length) return 0;
    const completed = tasks.filter(task => task.status === 'done').length;
    return Math.round((completed / tasks.length) * 100);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des tâches du projet...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !project) {
    return (
      <AdminLayout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error || 'Projet introuvable'}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="secondary" as={Link} to="/admin/projects">
            <i data-feather="arrow-left" className="me-2" />
            Retour aux projets
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="d-flex align-items-center mb-2">
              <Button 
                variant="outline-secondary" 
                size="sm"
                as={Link} 
                to={`/admin/projects/${id}`}
                className="me-3"
              >
                <i data-feather="arrow-left" className="me-1" style={{ width: '16px', height: '16px' }} />
                Retour au projet
              </Button>
              <div>
                <h1 className={`h3 mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  Tâches du projet : {project.title}
                </h1>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="info" className="px-2 py-1">
                    {tasks.length} tâche(s)
                  </Badge>
                  <Badge bg="success" className="px-2 py-1">
                    {calculateCompletionRate()}% terminé
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <Button variant="primary" as={Link} to="/admin/projects">
              <i data-feather="folder" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Tous les projets
            </Button>
            <Button variant="success" as={Link} to="/admin/tasks/create" state={{ project_id: id }}>
              <i data-feather="plus" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Nouvelle tâche
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <h3 className={`mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  {tasks.length}
                </h3>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  Total Tâches
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <h3 className="mb-0 text-success">
                  {tasks.filter(task => task.status === 'done').length}
                </h3>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  Terminées
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <h3 className="mb-0 text-primary">
                  {tasks.filter(task => task.status === 'in_progress').length}
                </h3>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  En Cours
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <h3 className="mb-0 text-warning">
                  {tasks.filter(task => task.status === 'todo').length}
                </h3>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  À Faire
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
        <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
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
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={1}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  &nbsp;
                </Form.Label>
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={fetchProjectTasks}
                >
                  <i data-feather="filter" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                </Button>
              </Col>
              <Col md={1}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  &nbsp;
                </Form.Label>
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={() => {
                    setSearch("");
                    setPriorityFilter("");
                    setStatusFilter("");
                  }}
                >
                  <i data-feather="refresh-cw" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tableau des tâches */}
        <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
          <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="list" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                Liste des Tâches ({tasks.length})
              </h5>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                <thead className="table-primary">
                  <tr>
                    <th>Tâche</th>
                    <th>Utilisateur</th>
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
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className={`small ${theme === "dark" ? "text-light" : "text-dark"}`}>
                            {task.user_name || task.user_email}
                          </div>
                          <small className={theme === "dark" ? "text-light" : "text-muted"}>
                            {task.user_email}
                          </small>
                        </div>
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
                        <Button
                          size="sm"
                          variant="outline-info"
                          as={Link}
                          to={`/admin/tasks/${task.id}`}
                          title="Voir les détails"
                        >
                          <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                        </Button>
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
                  {search || priorityFilter || statusFilter 
                    ? "Aucune tâche ne correspond à vos critères de recherche." 
                    : "Ce projet ne contient aucune tâche pour le moment."}
                </p>
                <Button variant="success" as={Link} to="/admin/tasks/create" state={{ project_id: id }}>
                  <i data-feather="plus" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                  Ajouter la première tâche
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  );
}