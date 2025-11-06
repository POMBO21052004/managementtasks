import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Alert, 
  Spinner,
  Badge
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function TaskCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [theme, setTheme] = useState("light");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [apiError, setApiError] = useState(null);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    user: '',
    project: ''
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

  // Charger la liste des utilisateurs 
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setApiError(null);
      
      const response = await api.get("/auth/admin/users/");
      
      let usersData = [];
      
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        usersData = response.data.results;
      } else if (response.data && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else {
        console.warn("⚠️ Format de réponse inattendu:", response.data);
        usersData = [];
      }
      
      console.log("📊 Utilisateurs chargés:", usersData);
      setUsers(usersData);
      
    } catch (err) {
      console.error("❌ Erreur détaillée:", err);
      
      let errorMessage = "Erreur lors du chargement des utilisateurs";
      
      if (err.response) {
        errorMessage = `Erreur ${err.response.status}: ${err.response.data?.message || 'Serveur inaccessible'}`;
      } else if (err.request) {
        errorMessage = "Impossible de contacter le serveur";
      } else {
        errorMessage = err.message || "Erreur inattendue";
      }
      
      setApiError(errorMessage);
      setUsers([]); 
    } finally {
      setLoadingUsers(false);
    }
  };

  // Charger la liste des projets
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await api.get("/tasks/projects/");
      setProjects(response.data.results || response.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des projets", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    feather.replace();
    fetchUsers();
    fetchProjects();

    // Pré-remplir le projet si passé dans la navigation
    if (location.state?.project_id) {
      setFormData(prev => ({
        ...prev,
        project: location.state.project_id
      }));
    }
  }, [location]);

  // Remplacer les icônes Feather
  useEffect(() => {
    feather.replace();
  }, [users, projects, loadingUsers, loadingProjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setErrors({ title: ["Le titre est obligatoire"] });
      return;
    }

    if (!formData.user) {
      setErrors({ user: ["Veuillez sélectionner un utilisateur"] });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setErrors({});
      
      // Nettoyer les données avant envoi
      const submitData = {
        ...formData,
        project: formData.project || null 
      };
      
      const response = await api.post("/tasks/tasks/", submitData);
      
      if (response.data) {
        navigate('/admin/tasks', { 
          state: { 
            message: 'Tâche créée avec succès ✅', 
            type: 'success' 
          }
        });
      }
    } catch (err) {
      console.error("❌ Erreur création tâche:", err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la création de la tâche');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetryUsers = () => {
    fetchUsers();
  };

  const handleRetryProjects = () => {
    fetchProjects();
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
              Créer une nouvelle tâche
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Création d'une nouvelle tâche pour un utilisateur
            </p>
          </div>
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/admin/tasks"
            className="d-flex align-items-center"
          >
            <i data-feather="arrow-left" className="me-2" style={{ width: '16px', height: '16px' }} />
            Retour
          </Button>
        </div>

        {/* Alertes globales */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <i data-feather="alert-circle" className="me-2" />
            <strong>Erreur:</strong> {error}
          </Alert>
        )}

        {apiError && (
          <Alert variant="warning" className="mb-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <i data-feather="alert-triangle" className="me-2" />
                <strong>Avertissement:</strong> {apiError}
              </div>
              <Button 
                variant="outline-warning" 
                size="sm" 
                onClick={handleRetryUsers}
                className="d-flex align-items-center"
              >
                <i data-feather="refresh-cw" className="me-1" style={{ width: '14px', height: '14px' }} />
                Réessayer
              </Button>
            </div>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Formulaire principal */}
            <Col lg={8} className="mb-4">
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className="border-0">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="plus-circle" className="me-2" style={{ width: '20px', height: '20px' }} />
                    Informations de la tâche
                  </h5>
                </Card.Header>
                <Card.Body>
                  {/* Sélection de l'utilisateur */}
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <i data-feather="user" className="me-2" style={{ width: '16px', height: '16px' }} />
                          Assigner à *
                          {Array.isArray(users) && users.length > 0 && (
                            <Badge bg="success" className="ms-2">
                              {users.length} utilisateur(s)
                            </Badge>
                          )}
                        </Form.Label>
                        
                        {loadingUsers ? (
                          <div className="d-flex align-items-center p-3 border rounded">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <span className="text-muted">Chargement des utilisateurs...</span>
                          </div>
                        ) : apiError ? (
                          <div className="p-3 border border-warning rounded bg-warning bg-opacity-10">
                            <div className="text-warning mb-2">
                              <i data-feather="users" className="me-2" />
                              Impossible de charger la liste des utilisateurs
                            </div>
                            <small className="text-muted">
                              Vous pouvez créer la tâche plus tard ou réessayer.
                            </small>
                          </div>
                        ) : !Array.isArray(users) || users.length === 0 ? (
                          <div className="p-3 border border-info rounded bg-info bg-opacity-10">
                            <div className="text-info">
                              <i data-feather="info" className="me-2" />
                              Aucun utilisateur disponible
                            </div>
                          </div>
                        ) : (
                          <Form.Select
                            name="user"
                            value={formData.user}
                            onChange={handleInputChange}
                            isInvalid={!!errors.user}
                            className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                            required
                          >
                            <option value="">Sélectionner un utilisateur...</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.username} - {user.email}
                                {user.first_name && user.last_name && ` (${user.first_name} ${user.last_name})`}
                                {user.is_admin && " [ADMIN]"} 
                              </option>
                            ))}
                          </Form.Select>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {errors.user?.[0]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Sélection du projet */}
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <i data-feather="folder" className="me-2" style={{ width: '16px', height: '16px' }} />
                          Projet (optionnel)
                          {Array.isArray(projects) && projects.length > 0 && (
                            <Badge bg="primary" className="ms-2">
                              {projects.length} projet(s)
                            </Badge>
                          )}
                        </Form.Label>
                        
                        {loadingProjects ? (
                          <div className="d-flex align-items-center p-3 border rounded">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <span className="text-muted">Chargement des projets...</span>
                          </div>
                        ) : !Array.isArray(projects) || projects.length === 0 ? (
                          <div className="p-3 border border-info rounded bg-info bg-opacity-10">
                            <div className="text-info">
                              <i data-feather="folder" className="me-2" />
                              Aucun projet disponible
                            </div>
                            <small className="text-muted">
                              <Link to="/admin/projects/create" className="text-info">
                                Créer un projet d'abord
                              </Link>
                            </small>
                          </div>
                        ) : (
                          <Form.Select
                            name="project"
                            value={formData.project}
                            onChange={handleInputChange}
                            isInvalid={!!errors.project}
                            className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                          >
                            <option value="">Aucun projet (tâche indépendante)</option>
                            {projects.map(project => (
                              <option key={project.id} value={project.id}>
                                {project.title}
                                {project.status !== 'active' && ` [${project.status}]`}
                              </option>
                            ))}
                          </Form.Select>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {errors.project?.[0]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="my-3" />

                  {/* Champs de la tâche */}
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <i data-feather="type" className="me-2" style={{ width: '16px', height: '16px' }} />
                          Titre de la tâche *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Ex: Développement de la fonctionnalité X"
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
                          placeholder="Décrivez en détail la tâche à accomplir..."
                          isInvalid={!!errors.description}
                          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.description?.[0]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <i data-feather="flag" className="me-2" style={{ width: '16px', height: '16px' }} />
                          Priorité
                        </Form.Label>
                        <Form.Select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        >
                          <option value="low">🟢 Basse</option>
                          <option value="medium">🟡 Moyenne</option>
                          <option value="high">🔴 Haute</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <i data-feather="activity" className="me-2" style={{ width: '16px', height: '16px' }} />
                          Statut initial
                        </Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        >
                          <option value="todo">⏳ À faire</option>
                          <option value="in_progress">🔄 En cours</option>
                          <option value="done">✅ Terminée</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <i data-feather="calendar" className="me-2" style={{ width: '16px', height: '16px' }} />
                          Date d'échéance
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="due_date"
                          value={formData.due_date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        />
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
                          to="/admin/tasks"
                          className="me-2"
                          disabled={loading}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="success"
                          type="submit"
                          disabled={loading || !Array.isArray(users) || users.length === 0}
                          className="d-flex align-items-center"
                        >
                          {loading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Création...
                            </>
                          ) : (
                            <>
                              {/* <i data-feather="plus" className="me-2" style={{ width: '16px', height: '16px' }} /> */}
                              {!Array.isArray(users) || users.length === 0 ? 'Aucun utilisateur' : 'Créer la tâche'}
                            </>
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Colonne latérale - Informations */}
            <Col lg={4}>
              <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="info" className="me-2 text-primary" style={{ width: '20px', height: '20px' }} />
                    Informations
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="small">
                    <div className="d-flex align-items-center mb-2">
                      <i data-feather="users" className="text-secondary me-2" style={{ width: '14px', height: '14px' }} />
                      <span>Utilisateurs chargés: <strong>{Array.isArray(users) ? users.length : 0}</strong></span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i data-feather="folder" className="text-secondary me-2" style={{ width: '14px', height: '14px' }} />
                      <span>Projets chargés: <strong>{Array.isArray(projects) ? projects.length : 0}</strong></span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i data-feather="database" className="text-secondary me-2" style={{ width: '14px', height: '14px' }} />
                      <span>Statut: {loadingUsers || loadingProjects ? 'Chargement...' : apiError ? 'Erreur' : 'Prêt'}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="help-circle" className="me-2 text-info" style={{ width: '20px', height: '20px' }} />
                    À propos des projets
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="small">
                    <div className="d-flex align-items-start mb-2">
                      <i data-feather="folder" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                      <span>Les projets permettent d'organiser les tâches par contexte</span>
                    </div>
                    <div className="d-flex align-items-start mb-2">
                      <i data-feather="link" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                      <span>Une tâche peut être indépendante ou liée à un projet</span>
                    </div>
                    <div className="d-flex align-items-start">
                      <i data-feather="bar-chart" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                      <span>Les statistiques par projet aident au suivi global</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </AdminLayout>
  );
}