import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Badge, Alert, Spinner, Modal, ProgressBar } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function AdminProjectShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("light");

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

  // Charger les données du projet
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tasks/projects/${id}/`);
        setProject(response.data);
        
        // Charger les statistiques
        const statsResponse = await api.get(`/tasks/projects/${id}/statistics/`);
        setStatistics(statsResponse.data);
      } catch (err) {
        setError('Erreur lors du chargement du projet');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  // Remplacer les icônes Feather après le rendu
  useEffect(() => {
    feather.replace();
  }, [project, statistics]);

  // Gérer la suppression
  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/projects/${id}/`);
      navigate('/admin/projects', { 
        state: { 
          message: 'Projet supprimé avec succès ✅', 
          type: 'success' 
        }
      });
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    }
    setShowDeleteModal(false);
  };

  // Marquer comme terminé
  const handleMarkCompleted = async () => {
    try {
      await api.post(`/tasks/projects/${id}/mark_completed/`);
      // Recharger les données
      const response = await api.get(`/tasks/projects/${id}/`);
      setProject(response.data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la modification");
    }
  };

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
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateCompletionRate = () => {
    if (!statistics || !statistics.total_tasks) return 0;
    return Math.round((statistics.completed_tasks / statistics.total_tasks) * 100);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des informations du projet...</p>
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
              to="/admin/projects"
              className="me-3"
            >
              <i data-feather="arrow-left" className="me-1" style={{ width: '16px', height: '16px' }} />
              Retour
            </Button>
            <div>
              <h1 className={`h3 mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                {project.title}
              </h1>
              <div className="d-flex align-items-center gap-2 mt-1">
                <Badge bg={getStatusBadge(project.status)} className="px-2 py-1">
                  {getStatusText(project.status)}
                </Badge>
                {statistics && (
                  <Badge bg="info" className="px-2 py-1">
                    {statistics.total_tasks || 0} tâches
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            as={Link} 
            to={`/admin/projects/${id}/edit`}
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
                    <span className="text-muted">Tâches terminées :</span>
                    <span className="fw-medium text-success">{statistics?.completed_tasks || 0}</span>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Taux d'achèvement :</span>
                    <span className="fw-medium text-info">{calculateCompletionRate()}%</span>
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

          {/* Statistiques détaillées */}
          {statistics && (
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="bar-chart" className="me-2" style={{ width: '20px', height: '20px' }} />
                  Statistiques du projet
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Progression globale */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Progression globale</span>
                    <span className="fw-bold">{calculateCompletionRate()}%</span>
                  </div>
                  <ProgressBar 
                    now={calculateCompletionRate()} 
                    variant={
                      calculateCompletionRate() >= 80 ? "success" :
                      calculateCompletionRate() >= 50 ? "warning" : "danger"
                    }
                    style={{ height: "10px" }}
                  />
                </div>

                <Row>
                  <Col md={6}>
                    <h6 className="mb-3">Par priorité</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>🔴 Haute</span>
                      <Badge bg="danger">{statistics.by_priority?.high || 0}</Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>🟡 Moyenne</span>
                      <Badge bg="warning">{statistics.by_priority?.medium || 0}</Badge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>🟢 Basse</span>
                      <Badge bg="success">{statistics.by_priority?.low || 0}</Badge>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h6 className="mb-3">Par statut</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>⏳ À faire</span>
                      <Badge bg="secondary">{statistics.by_status?.todo || 0}</Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>🔄 En cours</span>
                      <Badge bg="primary">{statistics.by_status?.in_progress || 0}</Badge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>✅ Terminée</span>
                      <Badge bg="success">{statistics.by_status?.done || 0}</Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
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
                <Button 
                  variant="primary"
                  as={Link}
                  to={`/admin/projects/${id}/tasks`}
                >
                  <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                  Voir toutes les tâches
                </Button>
                <Button 
                  variant="success"
                  as={Link}
                  to="/admin/tasks/create"
                  state={{ project_id: id }}
                >
                  <i data-feather="plus" className="me-2" style={{ width: '16px', height: '16px' }} />
                  Ajouter une tâche
                </Button>
                {project.status !== 'completed' && (
                  <Button 
                    variant="outline-success"
                    onClick={handleMarkCompleted}
                  >
                    <i data-feather="check-circle" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Marquer comme terminé
                  </Button>
                )}
                <Button 
                  variant="outline-primary" 
                  as={Link} 
                  to="/admin/projects"
                >
                  <i data-feather="folder" className="me-2" style={{ width: '16px', height: '16px' }} />
                  Tous les projets
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Utilisateurs assignés */}
          {statistics?.users_stats && statistics.users_stats.length > 0 && (
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="users" className="me-2" style={{ width: '20px', height: '20px' }} />
                  Utilisateurs assignés
                </h5>
              </Card.Header>
              <Card.Body>
                {statistics.users_stats.map((userStat, index) => (
                  <div key={userStat.user.id} className={`d-flex justify-content-between align-items-center ${index > 0 ? 'mt-2 pt-2 border-top' : ''}`}>
                    <div>
                      <div className="small fw-medium">{userStat.user.username}</div>
                      <div className="small text-muted">{userStat.user.email}</div>
                    </div>
                    <div className="text-end">
                      <Badge bg="primary">{userStat.total_tasks}</Badge>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

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
                <div className="d-flex align-items-start">
                  <i data-feather="clock" className="text-secondary me-2 mt-1" style={{ width: '16px', height: '16px' }} />
                  <div>
                    <div className="fw-medium">Dernière modification</div>
                    <div className="text-muted">{formatDate(project.updated_at)}</div>
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
          <p>Êtes-vous sûr de vouloir supprimer ce projet ?</p>
          <div className="alert alert-warning">
            <i data-feather="alert-triangle" className="me-2" style={{ width: "16px", height: "16px" }}></i>
            Cette action est irréversible. Le projet "{project.title}" sera définitivement supprimé.
          </div>
          {statistics && statistics.total_tasks > 0 && (
            <div className="alert alert-danger">
              <i data-feather="alert-octagon" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              <strong>Attention :</strong> {statistics.total_tasks} tâches associées seront également supprimées !
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
    </AdminLayout>
  );
}