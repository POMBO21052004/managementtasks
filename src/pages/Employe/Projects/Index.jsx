import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
import EmployeLayout from "../../../layouts/Employe/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function EmployeeProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  
  // Filtres
  const [search, setSearch] = useState("");
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

  // Charger les projets de l'employé
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      // Récupérer tous les projets puis filtrer ceux où l'employé a des tâches
      const response = await api.get("/tasks/projects/", { params });
      const allProjects = response.data.results || response.data || [];
      
      // Pour chaque projet, vérifier si l'employé a des tâches
      const projectsWithUserTasks = await Promise.all(
        allProjects.map(async (project) => {
          try {
            const tasksResponse = await api.get(`/tasks/projects/${project.id}/my_tasks/`);
            return {
              ...project,
              user_tasks: tasksResponse.data || [],
              user_tasks_count: tasksResponse.data.length || 0,
              user_completed_tasks: tasksResponse.data.filter(task => task.status === 'done').length || 0
            };
          } catch (error) {
            return {
              ...project,
              user_tasks: [],
              user_tasks_count: 0,
              user_completed_tasks: 0
            };
          }
        })
      );

      // Filtrer seulement les projets où l'employé a des tâches
      const userProjects = projectsWithUserTasks.filter(project => project.user_tasks_count > 0);
      setProjects(userProjects);
      
    } catch (err) {
      console.error("Erreur lors du chargement des projets", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    feather.replace();
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    feather.replace();
  }, [projects]);

  // Fonctions utilitaires
  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'completed': 'primary',
      'archived': 'secondary',
      'on_hold': 'warning'
    };
    return variants[status] || 'secondary';
  };

  const getStatusText = (status) => {
    const texts = {
      'active': 'Actif',
      'completed': 'Terminé',
      'archived': 'Archivé',
      'on_hold': 'En pause'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateCompletionRate = (project) => {
    if (!project.user_tasks_count) return 0;
    return Math.round((project.user_completed_tasks / project.user_tasks_count) * 100);
  };

  const getCompletionVariant = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'danger';
  };

  return (
    <EmployeLayout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
              Mes Projets
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Projets auxquels vous êtes assigné avec vos tâches
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" as={Link} to="/employe/dashboard">
              <i data-feather="arrow-left" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Dashboard
            </Button>
            <Button variant="outline-primary" as={Link} to="/employee/tasks">
              <i data-feather="list" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Mes Tâches
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  Recherche
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par titre de projet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                />
              </Col>
              <Col md={4}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  Statut
                </Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                >
                  <option value="">Tous</option>
                  <option value="active">Actif</option>
                  <option value="completed">Terminé</option>
                  <option value="on_hold">En pause</option>
                </Form.Select>
              </Col>
              <Col md={1}>
                <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  &nbsp;
                </Form.Label>
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={fetchProjects}
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
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                  }}
                >
                  <i data-feather="refresh-cw" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                  Réinitialiser
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tableau des projets */}
        <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
          <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="folder" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                Mes Projets ({projects.length})
              </h5>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                <thead className="table-primary">
                  <tr>
                    <th>Projet</th>
                    <th className="text-center">Mes Tâches</th>
                    <th className="text-center">Terminées</th>
                    <th className="text-center">Progression</th>
                    <th className="text-center">Statut Projet</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => {
                    const completionRate = calculateCompletionRate(project);
                    return (
                      <tr key={project.id}>
                        <td>
                          <div>
                            <div className={`fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                              {project.title}
                            </div>
                            {project.description && (
                              <small className={theme === "dark" ? "text-light" : "text-muted"}>
                                {project.description.length > 100 
                                  ? `${project.description.substring(0, 100)}...` 
                                  : project.description}
                              </small>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <Badge bg="primary" className="fs-6">
                            {project.user_tasks_count}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="success" className="fs-6">
                            {project.user_completed_tasks}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center">
                            <div className="flex-grow-1 me-2" style={{ maxWidth: "100px" }}>
                              <ProgressBar 
                                now={completionRate} 
                                variant={getCompletionVariant(completionRate)}
                                style={{ height: "8px" }}
                              />
                            </div>
                            <small className={theme === "dark" ? "text-light" : "text-dark"}>
                              {completionRate}%
                            </small>
                          </div>
                        </td>
                        <td className="text-center">
                          <Badge bg={getStatusBadge(project.status)}>
                            {getStatusText(project.status)}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              as={Link}
                              to={`/employee/projects/${project.id}/tasks`}
                              title="Voir mes tâches dans ce projet"
                            >
                              <i data-feather="list" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-info"
                              as={Link}
                              to={`/employee/projects/${project.id}`}
                              title="Voir les détails du projet"
                            >
                              <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {projects.length === 0 && !loading && (
              <div className="text-center py-5">
                <i data-feather="folder" className="mb-3" style={{ width: "48px", height: "48px", opacity: 0.5 }}></i>
                <h6 className={theme === "dark" ? "text-light" : "text-dark"}>Aucun projet trouvé</h6>
                <p className={theme === "dark" ? "text-light" : "text-muted"}>
                  {search || statusFilter 
                    ? "Aucun projet ne correspond à vos critères de recherche." 
                    : "Vous n'êtes assigné à aucun projet pour le moment."}
                </p>
                <Button variant="outline-primary" as={Link} to="/employee/tasks">
                  <i data-feather="list" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                  Voir toutes mes tâches
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement de vos projets...</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Statistiques résumées */}
        {projects.length > 0 && (
          <Row className="mt-4">
            <Col md={3}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Body className="text-center">
                  <div className={`h4 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                    {projects.length}
                  </div>
                  <small className={theme === "dark" ? "text-light" : "text-muted"}>
                    Projets Assignés
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Body className="text-center">
                  <div className="h4 mb-1 text-primary">
                    {projects.reduce((total, project) => total + project.user_tasks_count, 0)}
                  </div>
                  <small className={theme === "dark" ? "text-light" : "text-muted"}>
                    Total Tâches
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Body className="text-center">
                  <div className="h4 mb-1 text-success">
                    {projects.reduce((total, project) => total + project.user_completed_tasks, 0)}
                  </div>
                  <small className={theme === "dark" ? "text-light" : "text-muted"}>
                    Tâches Terminées
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Body className="text-center">
                  <div className="h4 mb-1 text-info">
                    {Math.round(
                      projects.reduce((total, project) => total + project.user_completed_tasks, 0) / 
                      Math.max(1, projects.reduce((total, project) => total + project.user_tasks_count, 0)) * 100
                    )}%
                  </div>
                  <small className={theme === "dark" ? "text-light" : "text-muted"}>
                    Taux d'Achèvement
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </EmployeLayout>
  );
}