// components/Admin/TaskDashboard.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Badge, Button, ProgressBar, Dropdown, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../services/api";

export default function AdminTaskDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [timeRange, setTimeRange] = useState("all"); // all, today, week, month

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
      const response = await api.get("/tasks/tasks/admin_dashboard/");
      setDashboardData(response.data);
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
  }, [dashboardData]);

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

  const calculateCompletionRate = (user) => {
    if (!user.total_tasks) return 0;
    return Math.round((user.completed_tasks / user.total_tasks) * 100);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement du dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!dashboardData) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <i data-feather="alert-triangle" className="text-warning mb-3" style={{ width: "48px", height: "48px" }}></i>
          <h5>Erreur lors du chargement des données</h5>
          <Button variant="primary" onClick={fetchDashboardData} className="mt-3">
            Réessayer
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { overview, users } = dashboardData;

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
              Dashboard des Tâches et Projets
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Vue d'ensemble de tous les projets et tâches par utilisateur
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="primary" as={Link} to="/admin/tasks">
              <i data-feather="list" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Voir toutes les tâches
            </Button>
            <Button variant="success" as={Link} to="/admin/projects">
              <i data-feather="folder" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Voir tous les projets
            </Button>
          </div>
        </div>

        {/* Cartes de statistiques globales */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className={`mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                      {overview.total_tasks}
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
                      {overview.completed_tasks}
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
                      {overview.pending_tasks}
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
                      {overview.total_users}
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      Utilisateurs
                    </small>
                  </div>
                  <div className="text-info">
                    <i data-feather="users" style={{ width: "24px", height: "24px" }}></i>
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
                      {overview.total_projects}
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      Projets
                    </small>
                  </div>
                  <div className="text-purple">
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
                    <h3 className="mb-0 text-orange">
                      {overview.active_projects}
                    </h3>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      Projets Actifs
                    </small>
                  </div>
                  <div className="text-orange">
                    <i data-feather="activity" style={{ width: "24px", height: "24px" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Taux d'achèvement global */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="bar-chart" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                  Taux d'Achèvement Global
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="flex-grow-1 me-3">
                    <ProgressBar 
                      now={overview.total_tasks ? Math.round((overview.completed_tasks / overview.total_tasks) * 100) : 0} 
                      variant="success"
                      style={{ height: "12px" }}
                    />
                  </div>
                  <div className="text-end">
                    <strong className={theme === "dark" ? "text-light" : "text-dark"}>
                      {overview.total_tasks ? Math.round((overview.completed_tasks / overview.total_tasks) * 100) : 0}%
                    </strong>
                  </div>
                </div>
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border-end border-secondary">
                      <div className={`h4 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        {overview.completed_tasks}
                      </div>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>Terminées</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end border-secondary">
                      <div className={`h4 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        {overview.pending_tasks}
                      </div>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>En Cours</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end border-secondary">
                      <div className={`h4 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        {overview.total_projects}
                      </div>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>Projets</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className={`h4 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                      {overview.total_tasks}
                    </div>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>Total Tâches</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tableau des utilisateurs avec leurs tâches */}
        <Row>
          <Col md={12}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="users" className="me-2" style={{ width: "20px", height: "20px" }}></i>
                    Tâches par Utilisateur
                  </h5>
                  <Badge bg="primary" className="fs-6">
                    {users.length} Utilisateurs
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                    <thead className="table-primary">
                      <tr>
                        <th>Utilisateur</th>
                        <th className="text-center">Total Tâches</th>
                        <th className="text-center">Terminées</th>
                        <th className="text-center">En Attente</th>
                        <th className="text-center">Taux d'Achèvement</th>
                        <th className="text-center">Performance</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <i data-feather="user" className="text-primary" style={{ width: "16px", height: "16px" }}></i>
                              </div>
                              <div>
                                <div className={`fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                                  {user.username}
                                </div>
                                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                                  {user.email}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <Badge bg="primary" className="fs-6">
                              {user.total_tasks || 0}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Badge bg="success" className="fs-6">
                              {user.completed_tasks || 0}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Badge bg="warning" className="fs-6">
                              {user.pending_tasks || 0}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="flex-grow-1 me-2" style={{ maxWidth: "100px" }}>
                                <ProgressBar 
                                  now={calculateCompletionRate(user)} 
                                  variant={
                                    calculateCompletionRate(user) >= 80 ? "success" :
                                    calculateCompletionRate(user) >= 50 ? "warning" : "danger"
                                  }
                                  style={{ height: "8px" }}
                                />
                              </div>
                              <small className={theme === "dark" ? "text-light" : "text-dark"}>
                                {calculateCompletionRate(user)}%
                              </small>
                            </div>
                          </td>
                          <td className="text-center">
                            <Badge 
                              bg={
                                calculateCompletionRate(user) >= 80 ? "success" :
                                calculateCompletionRate(user) >= 50 ? "warning" : "danger"
                              }
                            >
                              {calculateCompletionRate(user) >= 80 ? "Excellente" :
                               calculateCompletionRate(user) >= 50 ? "Moyenne" : "Faible"}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              as={Link}
                              to={`/admin/users/${user.id}`}
                              title="Voir les tâches de cet utilisateur"
                            >
                              <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-5">
                    <i data-feather="users" className="mb-3" style={{ width: "48px", height: "48px", opacity: 0.5 }}></i>
                    <h6 className={theme === "dark" ? "text-light" : "text-dark"}>Aucun utilisateur trouvé</h6>
                    <p className={theme === "dark" ? "text-light" : "text-muted"}>
                      Aucun utilisateur n'a encore créé de tâches.
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Cartes de performance rapide */}
        <Row className="mt-4">
          <Col md={4}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <i data-feather="award" className="text-warning mb-3" style={{ width: "32px", height: "32px" }}></i>
                <h5 className={theme === "dark" ? "text-light" : "text-dark"}>
                  Meilleur Performeur
                </h5>
                {users.length > 0 ? (
                  <>
                    <div className="fw-bold text-success mb-1">
                      {users.reduce((best, user) => {
                        const currentRate = calculateCompletionRate(user);
                        const bestRate = calculateCompletionRate(best);
                        return currentRate > bestRate ? user : best;
                      }, users[0]).username}
                    </div>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      {Math.max(...users.map(user => calculateCompletionRate(user)))}% de taux d'achèvement
                    </small>
                  </>
                ) : (
                  <small className={theme === "dark" ? "text-light" : "text-muted"}>
                    Aucune donnée disponible
                  </small>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <i data-feather="trending-up" className="text-success mb-3" style={{ width: "32px", height: "32px" }}></i>
                <h5 className={theme === "dark" ? "text-light" : "text-dark"}>
                  Tâches Créées
                </h5>
                <div className="fw-bold text-primary mb-1">
                  {overview.total_tasks}
                </div>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  Total des tâches créées
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Body className="text-center">
                <i data-feather="target" className="text-info mb-3" style={{ width: "32px", height: "32px" }}></i>
                <h5 className={theme === "dark" ? "text-light" : "text-dark"}>
                  Objectif Global
                </h5>
                <div className="fw-bold text-info mb-1">
                  {overview.total_tasks ? Math.round((overview.completed_tasks / overview.total_tasks) * 100) : 0}%
                </div>
                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                  Taux d'achèvement global
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}