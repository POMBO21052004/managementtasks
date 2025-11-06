import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Dropdown, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function AdminProjectList() {
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

  // Charger les projets
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get("/tasks/projects/", { params });
      setProjects(response.data.results || response.data || []);
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

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
              Gestion des Projets
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Administration de tous les projets
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="primary" as={Link} to="/admin/dashboard">
              <i data-feather="bar-chart" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Dashboard
            </Button>
            <Button variant="success" as={Link} to="/admin/projects/create">
              <i data-feather="plus" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Nouveau Projet
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
                  placeholder="Rechercher par titre ou description..."
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
                  <option value="archived">Archivé</option>
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
                Liste des Projets ({projects.length})
              </h5>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}>
                <thead className="table-primary">
                  <tr>
                    <th>Projet</th>
                    <th className="text-center">Tâches</th>
                    <th className="text-center">Terminées</th>
                    <th className="text-center">Statut</th>
                    <th>Créé le</th>
                    <th>Dernière modification</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div>
                          <div className={`fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`} title={project.title}>
                            {project.title.length > 15
                                ? `${project.title.substring(0, 15)}...` 
                                : project.title}
                          </div>
                          {project.description && (
                            <small className={theme === "dark" ? "text-light" : "text-muted"}>
                              {project.description.length > 70
                                ? `${project.description.substring(0, 70)}...` 
                                : project.description}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge bg="primary" className="fs-6">
                          {project.tasks_count || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg="success" className="fs-6">
                          {project.completed_tasks_count || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg={getStatusBadge(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                      </td>
                      <td>
                        <small className={theme === "dark" ? "text-light" : "text-muted"}>
                          {formatDate(project.created_at)}
                        </small>
                      </td>
                      <td>
                        <small className={theme === "dark" ? "text-light" : "text-muted"}>
                          {formatDate(project.updated_at)}
                        </small>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            size="sm"
                            variant="outline-info"
                            as={Link}
                            to={`/admin/projects/${project.id}`}
                            title="Voir les détails"
                          >
                            <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-warning"
                            as={Link}
                            to={`/admin/projects/${project.id}/edit`}
                            title="Modifier"
                          >
                            <i data-feather="edit" style={{ width: "14px", height: "14px" }}></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            as={Link}
                            to={`/admin/projects/${project.id}/tasks`}
                            title="Voir les tâches"
                          >
                            <i data-feather="list" style={{ width: "14px", height: "14px" }}></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {projects.length === 0 && !loading && (
              <div className="text-center py-5">
                <i data-feather="folder" className="mb-3" style={{ width: "48px", height: "48px", opacity: 0.5 }}></i>
                <h6 className={theme === "dark" ? "text-light" : "text-dark"}>Aucun projet trouvé</h6>
                <p className={theme === "dark" ? "text-light" : "text-muted"}>
                  Aucun projet ne correspond à vos critères de recherche.
                </p>
                <Button variant="success" as={Link} to="/admin/projects/create">
                  <i data-feather="plus" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                  Créer le premier projet
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des projets...</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  );
}