// components/Employee/Tasks/Edit.jsx
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
import { Link, useParams, useNavigate } from "react-router-dom";
import EmployeLayout from "../../../layouts/Employe/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function EmployeeTaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [theme, setTheme] = useState("light");
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    project: '',
    is_completed: false
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

  // Charger les projets
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

  // Charger les données de la tâche
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tasks/tasks/${id}/`);
        
        const taskData = response.data;
        setTask(taskData);
        
        // Pré-remplir le formulaire
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          priority: taskData.priority || 'medium',
          status: taskData.status || 'todo',
          due_date: taskData.due_date ? taskData.due_date.split('T')[0] : '',
          project: taskData.project || '',
          is_completed: taskData.is_completed || false
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
      fetchProjects();
    }
  }, [id]);

  // Remplacer les icônes Feather après le rendu
  useEffect(() => {
    feather.replace();
  }, [task, projects]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      
      // Préparer les données pour l'envoi
      const submitData = {
        ...formData,
        project: formData.project || null,
        // Si la tâche est marquée comme complétée, mettre à jour le statut
        status: formData.is_completed ? 'done' : formData.status
      };
      
      const response = await api.put(`/tasks/tasks/${id}/`, submitData);
      
      if (response.data) {
        // Rediriger vers la page de détail
        navigate(`/employee/tasks/${id}`);
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
      <EmployeLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des données...</p>
        </div>
      </EmployeLayout>
    );
  }

  if (error && !task) {
    return (
      <EmployeLayout>
        <Alert variant="danger" className="mb-4">
          <i data-feather="alert-circle" className="me-2" />
          {error}
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="secondary" as={Link} to="/employee/tasks">
            <i data-feather="arrow-left" className="me-2" />
            Retour à la liste
          </Button>
        </div>
      </EmployeLayout>
    );
  }

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
              to={`/employee/tasks/${id}`}
              className="me-3"
            >
              <i data-feather="arrow-left" className="me-1" style={{ width: '16px', height: '16px' }} />
              Retour
            </Button>
            <h1 className="h3 mb-0">Modifier la tâche</h1>
          </div>
          <p className="text-muted mb-0">
            Modification de la tâche : {task?.title}
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
                  Informations de la tâche
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Sélection du projet */}
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="d-flex align-items-center">
                        <i data-feather="folder" className="me-2" style={{ width: '16px', height: '16px' }} />
                        Projet (optionnel)
                        <Badge bg="primary" className="ms-2">
                          {projects.length} projet(s)
                        </Badge>
                      </Form.Label>
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
                      <Form.Control.Feedback type="invalid">
                        {errors.project?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-3" />

                {/* Champs du formulaire */}
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
                        placeholder="Titre de la tâche"
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
                        placeholder="Description détaillée de la tâche..."
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
                        isInvalid={!!errors.priority}
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.priority?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4} className="mb-3">
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
                        disabled={formData.is_completed}
                      >
                        <option value="todo">À faire</option>
                        <option value="in_progress">En cours</option>
                        <option value="done">Terminée</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.status?.[0]}
                      </Form.Control.Feedback>
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
                        isInvalid={!!errors.due_date}
                        className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.due_date?.[0]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>État d'achèvement</Form.Label>
                      <div>
                        <Form.Check
                          type="checkbox"
                          name="is_completed"
                          label="Tâche terminée"
                          checked={formData.is_completed}
                          onChange={handleInputChange}
                          className={theme === "dark" ? "text-light" : ""}
                        />
                        <Form.Text className="text-muted">
                          Cochez cette case si la tâche est complétée
                        </Form.Text>
                      </div>
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
                        to={`/employee/tasks/${id}`}
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
            {/* Informations sur la tâche */}
            {task && (
              <Card className={`border-0 shadow-sm mb-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="info" className="me-2 text-success" style={{ width: '20px', height: '20px' }} />
                    Informations actuelles
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">Créée le</span>
                    <span className="small">
                      {new Date(task.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small">Dernière modification</span>
                    <span className="small">
                      {new Date(task.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {task.project_title && (
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small">Projet</span>
                      <span className="small fw-bold">{task.project_title}</span>
                    </div>
                  )}
                  {task.completed_at && (
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="small">Terminée le</span>
                      <span className="small">
                        {new Date(task.completed_at).toLocaleDateString('fr-FR')}
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
                    <span>Les projets aident à organiser les tâches par contexte</span>
                  </div>
                  <div className="d-flex align-items-start mb-2">
                    <i data-feather="flag" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                    <span>Utilisez les priorités pour organiser le travail</span>
                  </div>
                  <div className="d-flex align-items-start mb-2">
                    <i data-feather="calendar" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                    <span>Les dates d'échéance aident à suivre les délais</span>
                  </div>
                  <div className="d-flex align-items-start">
                    <i data-feather="check-circle" className="text-primary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                    <span>Marquez comme terminée pour suivre la progression</span>
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
                    to={`/employee/tasks/${id}`}
                  >
                    <i data-feather="eye" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Voir la tâche
                  </Button>
                  {task?.project && (
                    <Button
                      variant="outline-primary"
                      as={Link}
                      to={`/employee/projects/${task.project}/tasks`}
                    >
                      <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                      Voir le projet
                    </Button>
                  )}
                  <Button
                    variant="outline-secondary"
                    as={Link}
                    to="/employee/tasks"
                  >
                    <i data-feather="list" className="me-2" style={{ width: '16px', height: '16px' }} />
                    Toutes mes tâches
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </EmployeLayout>
  );
}