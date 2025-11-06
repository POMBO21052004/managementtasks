import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Alert, 
  Spinner
} from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function AdminProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [theme, setTheme] = useState("light");
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active'
  });

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tasks/projects/${id}/`);
        
        const projectData = response.data;
        setProject(projectData);
        
        // Pré-remplir le formulaire
        setFormData({
          title: projectData.title || '',
          description: projectData.description || '',
          status: projectData.status || 'active'
        });
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Remplacer les icônes Feather après le rendu
  useEffect(() => {
    feather.replace();
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setErrors({});
      
      const response = await api.put(`/tasks/projects/${id}/`, formData);
      
      if (response.data) {
        // Rediriger vers la page de détail
        navigate(`/admin/projects/${id}`);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des données...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !project) {
    return (
      <AdminLayout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error}
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
              to={`/admin/projects/${id}`}
              className="me-3"
            >
              <i data-feather="arrow-left" className="me-1" style={{ width: '16px', height: '16px' }} />
              Retour
            </Button>
            <h1 className="h3 mb-0">Modifier le projet</h1>
          </div>
          <p className="text-muted mb-0">
            Modification du projet : {project?.title}
          </p>
        </div>
      </div>

      {/* Alertes */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Formulaire principal */}
          <Col lg={8} className="mb-4">
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className="border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="edit" className="me-2" style={{ width: '20px', height: '20px' }} />
                  Informations du projet
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Champs du formulaire */}
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <i data-feather="type" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Titre du projet *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Titre du projet"
                        isInvalid={!!errors.title}
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.title?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <i data-feather="file-text" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Description
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Description détaillée du projet..."
                        isInvalid={!!errors.description}
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.description?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        <i data-feather="activity" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Statut
                      </Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        isInvalid={!!errors.status}
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                      >
                        <option value="active">🟢 Actif</option>
                        <option value="on_hold">🟡 En pause</option>
                        <option value="completed">🔵 Terminé</option>
                        <option value="archived">⚫ Archivé</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.status?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                {/* Boutons d'action */}
                <Row>
                  <Col md={12}>
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="outline-secondary"
                        as={Link}
                        to={`/admin/projects/${id}`}
                        className="me-2"
                        disabled={saving}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={saving}
                        className="d-flex align-items-center"
                      >
                        {saving ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Mise à jour...
                          </>
                        ) : (
                          <>
                            {/* <i data-feather="save" className="me-2" style={{ width: '16px', height: '16px' }} /> */}
                            Enregistrer les Modifications
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Colonne latérale */}
          <Col lg={4}>
            {/* Informations sur le projet */}
            {project && (
              <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="info" className="me-2 text-success" style={{ width: '20px', height: '20px' }} />
                    Informations actuelles
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">Tâches totales</span>
                    <span className="small fw-bold">{project.tasks_count || 0}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">Tâches terminées</span>
                    <span className="small text-success">{project.completed_tasks_count || 0}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">Créé le</span>
                    <span className="small">
                      {new Date(project.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">Dernière modification</span>
                    <span className="small">
                      {new Date(project.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {project.completed_at && (
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="small">Terminé le</span>
                      <span className="small">
                        {new Date(project.completed_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Aide et conseils */}
            <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="help-circle" className="me-2 text-info" style={{ width: '20px', height: '20px' }} />
                  Conseils
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="small">
                  <div className="d-flex align-items-start mb-2">
                    <i data-feather="folder" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                    <span>Un titre clair aide à identifier rapidement le projet</span>
                  </div>
                  <div className="d-flex align-items-start mb-2">
                    <i data-feather="file-text" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                    <span>La description doit expliquer les objectifs du projet</span>
                  </div>
                  <div className="d-flex align-items-start mb-2">
                    <i data-feather="activity" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                    <span>Mettez à jour le statut selon l'avancement du projet</span>
                  </div>
                  <div className="d-flex align-items-start">
                    <i data-feather="users" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                    <span>Les projets peuvent contenir des tâches de plusieurs utilisateurs</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Actions supplémentaires */}
            <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
              <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <h5 className="mb-0 d-flex align-items-center">
                  <i data-feather="settings" className="me-2 text-warning" style={{ width: '20px', height: '20px' }} />
                  Actions supplémentaires
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-info"
                    as={Link}
                    to={`/admin/projects/${id}`}
                  >
                    <i data-feather="eye" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Voir le projet
                  </Button>
                  <Button
                    variant="outline-primary"
                    as={Link}
                    to={`/admin/projects/${id}/tasks`}
                  >
                    <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Voir les tâches
                  </Button>
                  <Button
                    variant="outline-secondary"
                    as={Link}
                    to="/admin/projects"
                  >
                    <i data-feather="folder" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Tous les projets
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </AdminLayout>
  );
}