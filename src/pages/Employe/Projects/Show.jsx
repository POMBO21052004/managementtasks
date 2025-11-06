import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Badge, Alert, Spinner, ProgressBar, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import EmployeLayout from "../../../layouts/Employe/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function EmployeeProjectShow() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Charger les données du projet
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Charger les informations du projet
        const projectResponse = await api.get(`/tasks/projects/${id}/`);
        setProject(projectResponse.data);
        
        // Charger les statistiques du projet
        try {
          const statsResponse = await api.get(`/tasks/projects/${id}/statistics/`);
          setStatistics(statsResponse.data);
        } catch (statsError) {
          console.error("Erreur lors du chargement des statistiques:", statsError);
        }
        
        // Charger les tâches de l'utilisateur dans ce projet
        const tasksResponse = await api.get(`/tasks/projects/${id}/my_tasks/`);
        setUserTasks(tasksResponse.data || []);
        
      } catch (err) {
        setError('Erreur lors du chargement du projet');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
        setTasksLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id]);

  // Remplacer les icônes Feather après le rendu
  useEffect(() => {
    feather.replace();
  }, [project, userTasks, statistics]);

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

  const getPriorityBadge = (priority) => {
    const variants = {
      'high': 'danger',
      'medium': 'warning',
      'low': 'success'
    };
    return variants[priority] || 'secondary';
  };

  const getPriorityText = (priority) => {
    const texts = {
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    };
    return texts[priority] || priority;
  };

  const getTaskStatusBadge = (status) => {
    const variants = {
      'done': 'success',
      'in_progress': 'primary',
      'todo': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getTaskStatusText = (status) => {
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
      day: 'numeric'
    });
  };

  const calculateUserCompletionRate = () => {
    if (!userTasks.length) return 0;
    const completed = userTasks.filter(task => task.status === 'done').length;
    return Math.round((completed / userTasks.length) * 100);
  };

  const calculateOverallCompletionRate = () => {
    if (!statistics || !statistics.total_tasks) return 0;
    return Math.round((statistics.completed_tasks / statistics.total_tasks) * 100);
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
          <p className="mt-2">Chargement des informations du projet...</p>
        </div>
      </EmployeLayout>
    );
  }

  if (error || !project) {
    return (
      <EmployeLayout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error || 'Projet introuvable'}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="secondary" as={Link} to="/employee/projects">
            <i data-feather="arrow-left" className="me-2" />
            Retour aux projets
          </Button>
          <Button variant="primary" as={Link} to="/employe/dashboard">
            <i data-feather="home" className="me-2" />
            Dashboard
          </Button>
        </div>
      </EmployeLayout>
    );
  }

  const userCompletionRate = calculateUserCompletionRate();
  const overallCompletionRate = calculateOverallCompletionRate();

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
              to="/employee/projects"
              className="me-3"
            >
              <i data-feather="arrow-left" className="me-1" style={{ width: '16px', height: '16px' }} />
              Mes Projets
            </Button>
            <div>
              <h1 className={`h3 mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                {project.title}
              </h1>
              <div className="d-flex align-items-center gap-2 mt-1">
                <Badge bg={getStatusBadge(project.status)} className="px-2 py-1">
                  {getStatusText(project.status)}
                </Badge>
                <Badge bg="info" className="px-2 py-1">
                  {userTasks.length} tâche(s) assignée(s)
                </Badge>
              </div>
            </div>
          </div>
          {project.description && (
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              {project.description}
            </p>
          )}
        </div>
        
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            as={Link} 
            to={`/employee/projects/${id}/tasks`}
            className="d-flex align-items-center"
          >
            <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
            Voir toutes mes tâches
          </Button>
          <Button 
            variant="outline-primary" 
            as={Link} 
            to="/employee/tasks/create"
            state={{ project_id: id }}
            className="d-flex align-items-center"
          >
            <i data-feather="plus" className="me-2" style={{ width: '16px', height: '16px' }} />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      <Row>
        {/* Informations principales */}
        <Col lg={8}>
          {/* Progression */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className={`border-0 shadow-sm h-100 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className="border-0">
                  <h6 className="mb-0 d-flex align-items-center">
                    <i data-feather="user" className="me-2 text-primary" style={{ width: '16px', height: '16px' }} />
                    Ma Progression
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <div className={`display-4 fw-bold mb-2 text-${getCompletionVariant(userCompletionRate)}`}>
                      {userCompletionRate}%
                    </div>
                    <div className="mb-3">
                      <ProgressBar 
                        now={userCompletionRate} 
                        variant={getCompletionVariant(userCompletionRate)}
                        style={{ height: '8px' }}
                      />
                    </div>
                    <div className="small text-muted">
                      {userTasks.filter(task => task.status === 'done').length} sur {userTasks.length} tâches terminées
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className={`border-0 shadow-sm h-100 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className="border-0">
                  <h6 className="mb-0 d-flex align-items-center">
                    <i data-feather="users" className="me-2 text-info" style={{ width: '16px', height: '16px' }} />
                    Progression Globale
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <div className={`display-4 fw-bold mb-2 text-${getCompletionVariant(overallCompletionRate)}`}>
                      {overallCompletionRate}%
                    </div>
                    <div className="mb-3">
                      <ProgressBar 
                        now={overallCompletionRate} 
                        variant={getCompletionVariant(overallCompletionRate)}
                        style={{ height: '8px' }}
                      />
                    </div>
                    <div className="small text-muted">
                      {statistics?.completed_tasks || 0} sur {statistics?.total_tasks || 0} tâches terminées
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Détails du projet */}
          <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="file-text" className="me-2" style={{ width: '20px', height: '20px' }} />
                Détails du projet
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={12}>
                  <h4 className="mb-3">{project.title}</h4>
                  {project.description ? (
                    <div className={`p-3 rounded ${theme === "dark" ? "bg-dark border" : "bg-light"}`}>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {project.description}
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
                    <Badge bg={getStatusBadge(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Tâches totales :</span>
                    <span className="fw-medium">{statistics?.total_tasks || 0}</span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Mes tâches :</span>
                    <span className="fw-medium text-primary">{userTasks.length}</span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Tâches terminées :</span>
                    <span className="fw-medium text-success">{statistics?.completed_tasks || 0}</span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Créé le :</span>
                    <span className="fw-medium">{formatDate(project.created_at)}</span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Dernière modification :</span>
                    <span className="fw-medium">{formatDate(project.updated_at)}</span>
                  </div>
                </Col>
                {project.completed_at && (
                  <Col md={6} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Terminé le :</span>
                      <span className="fw-medium text-success">{formatDate(project.completed_at)}</span>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          {/* Mes tâches récentes */}
          <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="list" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                  Mes Tâches dans ce Projet
                </h5>
                <Badge bg="primary">{userTasks.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {tasksLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                  <p className="mt-2">Chargement des tâches...</p>
                </div>
              ) : userTasks.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                    <thead className="table-primary">
                      <tr>
                        <th>Tâche</th>
                        <th className="text-center">Priorité</th>
                        <th className="text-center">Statut</th>
                        <th className="text-center">Échéance</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTasks.slice(0, 5).map((task) => (
                        <tr key={task.id}>
                          <td>
                            <div>
                              <div className={`fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                                {task.title}
                              </div>
                              {task.description && (
                                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                                  {task.description.length > 80 
                                    ? `${task.description.substring(0, 80)}...` 
                                    : task.description}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            <Badge bg={getPriorityBadge(task.priority)}>
                              {getPriorityText(task.priority)}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Badge bg={getTaskStatusBadge(task.status)}>
                              {getTaskStatusText(task.status)}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <small className={theme === "dark" ? "text-light" : "text-muted"}>
                              {formatDate(task.due_date)}
                            </small>
                          </td>
                          <td className="text-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              as={Link}
                              to={`/employee/tasks/${task.id}`}
                              title="Voir les détails"
                            >
                              <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  {userTasks.length > 5 && (
                    <div className="text-center mt-3">
                      <Button 
                        variant="outline-primary" 
                        as={Link} 
                        to={`/employee/projects/${id}/tasks`}
                        size="sm"
                      >
                        Voir toutes mes {userTasks.length} tâches
                        <i data-feather="arrow-right" className="ms-1" style={{ width: "14px", height: "14px" }}></i>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i data-feather="check-square" className="mb-3" style={{ width: "48px", height: "48px", opacity: 0.5 }}></i>
                  <h6 className={theme === "dark" ? "text-light" : "text-dark"}>Aucune tâche assignée</h6>
                  <p className={theme === "dark" ? "text-light" : "text-muted"}>
                    Vous n'avez pas de tâches dans ce projet pour le moment.
                  </p>
                  <Button 
                    variant="primary" 
                    as={Link} 
                    to="/employee/tasks/create"
                    state={{ project_id: id }}
                  >
                    <i data-feather="plus" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                    Créer une tâche
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Statistiques du projet */}
          {statistics && (
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="bar-chart" className="me-2 text-info" style={{ width: '20px', height: '20px' }} />
                  Statistiques du Projet
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="small">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Total des tâches</span>
                    <Badge bg="primary">{statistics.total_tasks}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Tâches terminées</span>
                    <Badge bg="success">{statistics.completed_tasks}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Tâches en cours</span>
                    <Badge bg="warning">{statistics.pending_tasks}</Badge>
                  </div>
                  
                  <hr className="my-2" />
                  
                  <h6 className="mb-2">Par priorité</h6>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small">🔴 Haute</span>
                    <Badge bg="danger">{statistics.by_priority?.high || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small">🟡 Moyenne</span>
                    <Badge bg="warning">{statistics.by_priority?.medium || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small">🟢 Basse</span>
                    <Badge bg="success">{statistics.by_priority?.low || 0}</Badge>
                  </div>

                  <hr className="my-2" />
                  
                  <h6 className="mb-2">Par statut</h6>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small">⏳ À faire</span>
                    <Badge bg="secondary">{statistics.by_status?.todo || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small">🔄 En cours</span>
                    <Badge bg="primary">{statistics.by_status?.in_progress || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small">✅ Terminée</span>
                    <Badge bg="success">{statistics.by_status?.done || 0}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Actions rapides */}
          <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="zap" className="me-2 text-warning" style={{ width: '20px', height: '20px' }} />
                Actions Rapides
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  as={Link}
                  to={`/employee/projects/${id}/tasks`}
                >
                  <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                  Toutes mes tâches
                </Button>
                <Button
                  variant="success"
                  as={Link}
                  to="/employee/tasks/create"
                  state={{ project_id: id }}
                >
                  <i data-feather="plus" className="me-2" style={{ width: '16px', height: '16px' }} />
                  Nouvelle tâche
                </Button>
                <Button
                  variant="outline-secondary"
                  as={Link}
                  to="/employee/projects"
                >
                  <i data-feather="folder" className="me-2" style={{ width: '16px', height: '16px' }} />
                  Mes projets
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Informations du projet */}
          <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <Card.Header className="border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <i data-feather="info" className="me-2 text-secondary" style={{ width: '20px', height: '20px' }} />
                Informations
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="small">
                <div className="d-flex align-items-start mb-3">
                  <i data-feather="hash" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">ID Projet</div>
                    <div className="text-muted">{project.id}</div>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <i data-feather="calendar" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">Date de création</div>
                    <div className="text-muted">{formatDate(project.created_at)}</div>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-3">
                  <i data-feather="clock" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">Dernière modification</div>
                    <div className="text-muted">{formatDate(project.updated_at)}</div>
                  </div>
                </div>
                {statistics?.users_stats && statistics.users_stats.length > 0 && (
                  <div className="d-flex align-items-start">
                    <i data-feather="users" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                    <div>
                      <div className="fw-medium">Utilisateurs</div>
                      <div className="text-muted">{statistics.users_stats.length} participant(s)</div>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </EmployeLayout>
  );
}