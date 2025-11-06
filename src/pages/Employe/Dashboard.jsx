import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Badge, ProgressBar, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import EmployeLayout from "../../layouts/Employe/Layout";
import feather from "feather-icons";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function EmployeeDashboard() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

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

  // Charger les données du dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques des tâches
      const statsResponse = await api.get("/tasks/tasks/statistics/");
      setStats(statsResponse.data);
      
      // Charger les projets de l'utilisateur
      const projectsResponse = await api.get("/tasks/projects/");
      const allProjects = projectsResponse.data.results || projectsResponse.data || [];
      
      // Filtrer les projets où l'utilisateur a des tâches
      const projectsWithUserTasks = await Promise.all(
        allProjects.map(async (project) => {
          try {
            const tasksResponse = await api.get(`/tasks/projects/${project.id}/my_tasks/`);
            const userTasks = tasksResponse.data || [];
            return {
              ...project,
              user_tasks_count: userTasks.length,
              user_completed_tasks: userTasks.filter(task => task.status === 'done').length
            };
          } catch (error) {
            return {
              ...project,
              user_tasks_count: 0,
              user_completed_tasks: 0
            };
          }
        })
      );

      const filteredProjects = projectsWithUserTasks.filter(project => project.user_tasks_count > 0);
      setUserProjects(filteredProjects);
      
      // Calculer les statistiques des projets
      const projectStatsData = {
        total_projects: filteredProjects.length,
        total_tasks_in_projects: filteredProjects.reduce((total, project) => total + project.user_tasks_count, 0),
        completed_tasks_in_projects: filteredProjects.reduce((total, project) => total + project.user_completed_tasks, 0),
        active_projects: filteredProjects.filter(project => project.status === 'active').length
      };
      setProjectStats(projectStatsData);
      
      // Charger les tâches récentes
      const tasksResponse = await api.get("/tasks/tasks/my_tasks/");
      setRecentTasks(tasksResponse.data.slice(0, 5)); // 5 tâches les plus récentes
      
    } catch (err) {
      console.error("Erreur lors du chargement du dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    feather.replace();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    feather.replace();
  }, [stats, recentTasks, userProjects]);

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

  const getProjectStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'completed': 'primary',
      'archived': 'secondary',
      'on_hold': 'warning'
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

  const getProjectStatusText = (status) => {
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

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  const calculateCompletionRate = () => {
    if (!stats || !stats.total) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const calculateProjectCompletionRate = (project) => {
    if (!project.user_tasks_count) return 0;
    return Math.round((project.user_completed_tasks / project.user_tasks_count) * 100);
  };

  const getCompletionVariant = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <EmployeLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement de votre dashboard...</p>
        </div>
      </EmployeLayout>
    );
  }

  return (
    <EmployeLayout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
              Mon Tableau de Bord
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Vue d'ensemble de vos tâches, projets et activités
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" as={Link} to="/employee/projects">
              <i data-feather="folder" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Mes Projets
            </Button>
            <Button variant="primary" as={Link} to="/employee/tasks">
              <i data-feather="list" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Mes Tâches
            </Button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className={`mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                      {stats?.total || 0}
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      Total Tâches
                    </small>
                  </div>
                  <div className="text-primary">
                    <i data-feather="check-square" style={{ width: "24px", height: "24px" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0 text-success">
                      {stats?.completed || 0}
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      Terminées
                    </small>
                  </div>
                  <div className="text-success">
                    <i data-feather="check-circle" style={{ width: "24px", height: "24px" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0 text-warning">
                      {stats?.pending || 0}
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      En Attente
                    </small>
                  </div>
                  <div className="text-warning">
                    <i data-feather="clock" style={{ width: "24px", height: "24px" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0 text-info">
                      {projectStats?.total_projects || 0}
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      Projets
                    </small>
                  </div>
                  <div className="text-info">
                    <i data-feather="folder" style={{ width: "24px", height: "24px" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0 text-purple">
                      {projectStats?.total_tasks_in_projects || 0}
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      Tâches Projets
                    </small>
                  </div>
                  <div className="text-purple">
                    <i data-feather="list" style={{ width: "24px", height: "24px" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0 text-orange">
                      {calculateCompletionRate()}%
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      Achèvement
                    </small>
                  </div>
                  <div className="text-orange">
                    <i data-feather="target" style={{ width: "24px", height: "24px" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Progression et Projets */}
        <Row className="mb-4">
          {/* Progression des Tâches */}
          <Col md={6}>
            <Card className={`border-0 shadow-sm h-100 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="bar-chart" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                  Progression des Tâches
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={theme === "dark" ? "text-light" : "text-dark"}>
                      Taux d'achèvement global
                    </span>
                    <strong className={theme === "dark" ? "text-light" : "text-dark"}>
                      {calculateCompletionRate()}%
                    </strong>
                  </div>
                  <ProgressBar 
                    now={calculateCompletionRate()} 
                    variant={getCompletionVariant(calculateCompletionRate())}
                    style={{ height: "12px" }}
                  />
                </div>
                
                <Row className="text-center">
                  <Col md={4}>
                    <div className="border-end border-secondary">
                      <div className={`h4 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        {stats?.by_status?.todo || 0}
                      </div>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>À Faire</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="border-end border-secondary">
                      <div className={`h4 mb-1 text-primary ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        {stats?.by_status?.in_progress || 0}
                      </div>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>En Cours</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className={`h4 mb-1 text-success ${theme === "dark" ? "text-light" : "text-dark"}`}>
                      {stats?.by_status?.done || 0}
                    </div>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>Terminées</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Mes Projets */}
          <Col md={6}>
            <Card className={`border-0 shadow-sm h-100 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="folder" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                    Mes Projets
                  </h5>
                  <Button variant="outline-primary" size="sm" as={Link} to="/employee/projects">
                    Voir tout
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {userProjects.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {userProjects.slice(0, 4).map((project) => {
                      const completionRate = calculateProjectCompletionRate(project);
                      return (
                        <div 
                          key={project.id} 
                          className={`list-group-item list-group-item-action border-0 ${
                            theme === "dark" ? "bg-dark text-light" : ""
                          }`}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                <h6 className={`mb-0 me-2 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                                  {project.title}
                                </h6>
                                <Badge bg={getProjectStatusBadge(project.status)} className="me-2">
                                  {getProjectStatusText(project.status)}
                                </Badge>
                                <Badge bg="primary">
                                  {project.user_tasks_count} tâche(s)
                                </Badge>
                              </div>
                              
                              <div className="d-flex align-items-center mb-2">
                                <div className="flex-grow-1 me-2" style={{ maxWidth: "100px" }}>
                                  <ProgressBar 
                                    now={completionRate} 
                                    variant={getCompletionVariant(completionRate)}
                                    style={{ height: "6px" }}
                                  />
                                </div>
                                <small className={theme === "dark" ? "text-light" : "text-dark"}>
                                  {completionRate}%
                                </small>
                              </div>
                              
                              <div className="small text-muted">
                                {project.user_completed_tasks} sur {project.user_tasks_count} tâches terminées
                              </div>
                            </div>
                            
                            <div className="d-flex gap-1 ms-3">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                as={Link}
                                to={`/employee/projects/${project.id}`}
                                title="Voir le projet"
                              >
                                <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i data-feather="folder" className="text-muted mb-3" style={{ width: "48px", height: "48px" }}></i>
                    <h6 className={theme === "dark" ? "text-light" : "text-dark"}>Aucun projet</h6>
                    <p className={theme === "dark" ? "text-light" : "text-muted"}>
                      Vous n'êtes assigné à aucun projet pour le moment.
                    </p>
                    <Button variant="primary" as={Link} to="/employee/tasks">
                      Voir mes tâches
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tâches récentes et Priorités */}
        <Row className="mb-4">
          {/* Tâches récentes */}
          <Col md={8}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="clock" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                    Tâches Récentes
                  </h5>
                  <Button variant="outline-primary" size="sm" as={Link} to="/employee/tasks">
                    Voir tout
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {recentTasks.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`list-group-item list-group-item-action border-0 ${
                          theme === "dark" ? "bg-dark text-light" : ""
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <h6 className={`mb-0 me-2 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                                {task.title}
                              </h6>
                              <Badge bg={getPriorityBadge(task.priority)} className="me-2">
                                {getPriorityText(task.priority)}
                              </Badge>
                              <Badge bg={getStatusBadge(task.status)}>
                                {getStatusText(task.status)}
                              </Badge>
                              {isOverdue(task.due_date, task.status) && (
                                <Badge bg="danger" className="ms-2">
                                  <i data-feather="alert-triangle" className="me-1" style={{ width: "12px", height: "12px" }}></i>
                                  En retard
                                </Badge>
                              )}
                            </div>
                            
                            {task.description && (
                              <p className={`mb-1 small ${theme === "dark" ? "text-light" : "text-muted"}`}>
                                {task.description.length > 100 
                                  ? `${task.description.substring(0, 100)}...` 
                                  : task.description}
                              </p>
                            )}
                            
                            <div className="small text-muted">
                              {task.project_title && (
                                <span className="me-3">
                                  <i data-feather="folder" className="me-1" style={{ width: "12px", height: "12px" }}></i>
                                  {task.project_title}
                                </span>
                              )}
                              {task.due_date && (
                                <span className="me-3">
                                  <i data-feather="calendar" className="me-1" style={{ width: "12px", height: "12px" }}></i>
                                  {formatDate(task.due_date)}
                                </span>
                              )}
                              <span>
                                <i data-feather="clock" className="me-1" style={{ width: "12px", height: "12px" }}></i>
                                {formatDate(task.created_at)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="d-flex gap-1 ms-3">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              as={Link}
                              to={`/employee/tasks/${task.id}`}
                              title="Voir les détails"
                            >
                              <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i data-feather="check-circle" className="text-muted mb-3" style={{ width: "48px", height: "48px" }}></i>
                    <h6 className={theme === "dark" ? "text-light" : "text-dark"}>Aucune tâche récente</h6>
                    <p className={theme === "dark" ? "text-light" : "text-muted"}>
                      Vous n'avez pas encore de tâches. Commencez par en créer une !
                    </p>
                    <Button variant="primary" as={Link} to="/employee/tasks/create">
                      Créer ma première tâche
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          {/* Priorités et Actions rapides */}
          <Col md={4}>
            {/* Tâches par Priorité */}
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="flag" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                  Tâches par Priorité
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <div className="mb-3">
                    <Badge bg="danger" className="fs-6 px-3 py-2 mb-2 d-block">
                      <i data-feather="alert-triangle" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Haute: {stats?.by_priority?.high || 0}
                    </Badge>
                    <Badge bg="warning" className="fs-6 px-3 py-2 mb-2 d-block">
                      <i data-feather="flag" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Moyenne: {stats?.by_priority?.medium || 0}
                    </Badge>
                    <Badge bg="success" className="fs-6 px-3 py-2 d-block">
                      <i data-feather="check" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Basse: {stats?.by_priority?.low || 0}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Actions rapides */}
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="zap" className="me-2 text-warning" style={{ width: "20px", height: "20px" }}></i>
                  Actions Rapides
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    as={Link}
                    to="/employee/tasks/create"
                  >
                    <i data-feather="plus" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Nouvelle Tâche
                  </Button>
                  <Button
                    variant="outline-primary"
                    as={Link}
                    to="/employee/projects"
                  >
                    <i data-feather="folder" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Mes Projets
                  </Button>
                  <Button
                    variant="outline-success"
                    as={Link}
                    to="/employee/tasks"
                  >
                    <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Toutes mes Tâches
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </EmployeLayout>
  );
}