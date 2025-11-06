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
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/Layout";
import feather from "feather-icons";
import api from "../../../services/api";

export default function ProjectCreate() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    feather.replace();
  }, []);

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
    
    try {
      setLoading(true);
      setError(null);
      setErrors({});
      
      const response = await api.post("/tasks/projects/", formData);
      
      if (response.data) {
        navigate('/admin/projects', { 
          state: { 
            message: 'Projet créé avec succès ✅', 
            type: 'success' 
          }
        });
      }
    } catch (err) {
      console.error("❌ Erreur création projet:", err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la création du projet');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className={`h3 mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
              Créer un nouveau projet
            </h1>
            <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
              Création d'un nouveau projet pour organiser les tâches
            </p>
          </div>
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/admin/projects"
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

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Formulaire principal */}
            <Col lg={8} className="mb-4">
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className="border-0">
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="folder-plus" className="me-2" style={{ width: '20px', height: '20px' }} />
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
                          placeholder="Ex: Développement Application Mobile"
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
                          placeholder="Décrivez les objectifs et le contexte du projet..."
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
                          Statut initial
                        </Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                        >
                          <option value="active">🟢 Actif</option>
                          <option value="on_hold">🟡 En pause</option>
                          <option value="archived">⚫ Archivé</option>
                        </Form.Select>
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
                          to="/admin/projects"
                          className="me-2"
                          disabled={loading}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="success"
                          type="submit"
                          disabled={loading}
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
                              Créer le projet
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
                    À propos des projets
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="small">
                    <div className="d-flex align-items-start mb-3">
                      <i data-feather="folder" className="text-success me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                      <span>Les projets permettent d'organiser les tâches par contexte</span>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <i data-feather="users" className="text-info me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                      <span>Plusieurs utilisateurs peuvent avoir des tâches dans un même projet</span>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <i data-feather="bar-chart" className="text-warning me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                      <span>Suivez la progression globale de chaque projet</span>
                    </div>
                    <div className="d-flex align-items-start">
                      <i data-feather="settings" className="text-secondary me-2 mt-1" style={{ width: '14px', height: '14px' }} />
                      <span>Modifiez le statut selon l'avancement du projet</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <i data-feather="help-circle" className="me-2 text-info" style={{ width: '20px', height: '20px' }} />
                    Statuts des projets
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="small">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-success me-2">Actif</span>
                      <span>Projet en cours de développement</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-warning me-2">En pause</span>
                      <span>Projet temporairement suspendu</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-primary me-2">Terminé</span>
                      <span>Projet achevé avec succès</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-secondary me-2">Archivé</span>
                      <span>Projet conservé pour référence</span>
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