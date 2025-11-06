
import React, { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import feather from "feather-icons";
import {
  Container, Table, Button, Form, Modal, Row, Col, Dropdown, Badge, Card, Toast, ToastContainer,
} from "react-bootstrap";
import AdminLayout from "../../../layouts/Admin/Layout";
import { Link } from "react-router-dom";

export default function AdminUsers() {
  // États
  const [users, setUsers] = useState([]); // Toujours initialiser comme tableau vide
  const [checkedUsers, setCheckedUsers] = useState([]);

  // Filtres
  const [search, setSearch] = useState("");
  const [createdAtFilter, setCreatedAtFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  // États Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // États du formulaire
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    phone: "",
    is_admin: false,
    is_verified: false
  });

  // États de chargement
  const [loading, setLoading] = useState(true);

  // État du thème
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

  // Afficher les notifications toast
  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Récupérer les utilisateurs avec filtres
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (createdAtFilter) params.created_at = createdAtFilter;

      const res = await api.get("/auth/admin/users/", { params });
      
      // CORRECTION : S'assurer que users est toujours un tableau
      const usersData = Array.isArray(res.data) ? res.data : 
                       res.data.results ? res.data.results : 
                       res.data.users ? res.data.users : 
                       [];
      
      console.log('Données utilisateurs reçues:', usersData); // Debug
      setUsers(usersData);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs", err);
      showToastMessage("Erreur lors du chargement des utilisateurs", 'danger');
      // En cas d'erreur, s'assurer que users reste un tableau vide
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, createdAtFilter]);

  useEffect(() => {
    feather.replace();
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    feather.replace();
  }, [users, checkedUsers]);

  // Gérer la création d'utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await api.post("/auth/admin/users/", form);
      fetchUsers();
      setShowAddModal(false);
      setForm({
        username: "",
        email: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        phone: "",
        is_admin: false,
        is_verified: false
      });
      showToastMessage("Utilisateur créé avec succès", 'success');
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data || {});
        showToastMessage("Erreur de validation", 'danger');
      } else {
        console.error(err);
        showToastMessage("Erreur lors de la création", 'danger');
      }
    }
  };

  // Gérer la suppression simple ou en lot
  const confirmDelete = (userId = null) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const idsToDelete = userToDelete ? [userToDelete] : checkedUsers;
      
      if (userToDelete) {
        // Suppression d'un utilisateur unique
        await api.delete(`/auth/admin/users/${userToDelete}/`);
      } else {
        // Suppression en lot
        for (const userId of idsToDelete) {
          await api.delete(`/auth/admin/users/${userId}/`);
        }
      }
      
      fetchUsers();
      setShowDeleteModal(false);
      setCheckedUsers([]);
      setUserToDelete(null);
      showToastMessage("Utilisateur(s) supprimé(s) avec succès", 'success');
    } catch (err) {
      console.error(err);
      showToastMessage("Erreur lors de la suppression", 'danger');
    }
  };

  // Gérer les cases à cocher pour la suppression en lot
  const handleCheck = (event) => {
    const { value, checked } = event.target;
    const userId = parseInt(value);
    
    if (checked) {
      setCheckedUsers(prev => [...prev, userId]);
    } else {
      setCheckedUsers(prev => prev.filter(item => item !== userId));
    }
  };

  // Gérer la sélection globale
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setCheckedUsers(users.map(user => user.id));
    } else {
      setCheckedUsers([]);
    }
  };

  // Toggle statut admin
  const handleToggleAdmin = async (userId) => {
    try {
      await api.post(`/auth/admin/users/${userId}/toggle_admin/`);
      fetchUsers();
      showToastMessage("Statut admin modifié avec succès", 'success');
    } catch (err) {
      console.error(err);
      showToastMessage(err.response?.data?.error || "Erreur lors de la modification", 'danger');
    }
  };

  // Toggle statut vérifié
  const handleToggleVerified = async (userId) => {
    try {
      await api.post(`/auth/admin/users/${userId}/toggle_verified/`);
      fetchUsers();
      showToastMessage("Statut vérification modifié avec succès", 'success');
    } catch (err) {
      console.error(err);
      showToastMessage("Erreur lors de la modification", 'danger');
    }
  };

  // CORRECTION : Fonctions de calcul des statistiques avec vérification
  const adminUsers = Array.isArray(users) ? users.filter(user => user.is_admin) : [];
  const verifiedUsers = Array.isArray(users) ? users.filter(user => user.is_verified) : [];
  const normalUsers = Array.isArray(users) ? users.filter(user => !user.is_admin) : [];

  if (loading) {
    return (
      <AdminLayout>
        <Container className="py-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2">Chargement des utilisateurs...</p>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container className="py-4">
        {/* En-tête et statistiques */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className={`me-3 p-3 rounded-circle ${theme === "dark" ? "bg-primary bg-opacity-25" : "bg-primary bg-opacity-10"}`}>
              <i data-feather="users" className="text-primary" style={{ width: "24px", height: "24px" }}></i>
            </div>
            <div>
              <h2 className={`mb-1 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                Gestion des Utilisateurs
              </h2>
              <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
                Administration centrale de tous les utilisateurs du système
              </p>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className={`mb-0 ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        {Array.isArray(users) ? users.length : 0}
                      </h3>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>
                        Total Utilisateurs
                      </small>
                    </div>
                    <div className="text-primary">
                      <i data-feather="users" style={{ width: "24px", height: "24px" }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="mb-0 text-success">
                        {adminUsers.length}
                      </h3>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>
                        Administrateurs
                      </small>
                    </div>
                    <div className="text-success">
                      <i data-feather="shield" style={{ width: "24px", height: "24px" }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="mb-0 text-warning">
                        {verifiedUsers.length}
                      </h3>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>
                        Vérifiés
                      </small>
                    </div>
                    <div className="text-warning">
                      <i data-feather="check-circle" style={{ width: "24px", height: "24px" }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className={`border-0 shadow-sm ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="mb-0 text-info">
                        {normalUsers.length}
                      </h3>
                      <small className={theme === "dark" ? "text-light" : "text-muted"}>
                        Utilisateurs Normaux
                      </small>
                    </div>
                    <div className="text-info">
                      <i data-feather="user" style={{ width: "24px", height: "24px" }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Panneau principal */}
        <Card className={`shadow-sm border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
          <Card.Header className={`border-0 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <i data-feather="users" className="text-primary me-2" style={{ width: "20px", height: "20px" }}></i>
                <span className={`fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                  Liste des Utilisateurs
                </span>
              </div>
              <div className="d-flex gap-2 mt-2 mt-md-0">
                {checkedUsers.length > 0 && (
                  <Button variant="danger" className="d-flex align-items-center" onClick={() => confirmDelete()}>
                    <i data-feather="trash-2" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                    Supprimer ({checkedUsers.length})
                  </Button>
                )}
                <Button variant="success" className="d-flex align-items-center" onClick={() => setShowAddModal(true)}>
                  <i data-feather="user-plus" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                  Nouvel Utilisateur
                </Button>
              </div>
            </div>
          </Card.Header>

          <Card.Body className={theme === "dark" ? "bg-dark" : "bg-white"}>
            {/* Filtres de recherche */}
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: theme === "dark" ? "#1a1a1a" : "#f8f9fa" }}>
              <div className="row g-3">
                <div className="col-md-4">
                  <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                    <i data-feather="search" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                    Recherche Globale
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nom, email, téléphone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchUsers()}
                    className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                  />
                </div>
                <div className="col-md-3">
                  <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                    <i data-feather="calendar" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                    Date de création
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={createdAtFilter}
                    onChange={e => setCreatedAtFilter(e.target.value)}
                    className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                  />
                </div>
                <div className="col-md-3">
                  <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                    <i data-feather="shield" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                    Rôle
                  </Form.Label>
                  <Form.Select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                  >
                    <option value="">Tous les rôles</option>
                    <option value="admin">Administrateurs</option>
                    <option value="user">Utilisateurs normaux</option>
                  </Form.Select>
                </div>
                <div className="col-md-2">
                  <Form.Label className={`small fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                    &nbsp;
                  </Form.Label>
                  <Button 
                    variant="primary" 
                    className="w-100"
                    onClick={fetchUsers}
                  >
                    <i data-feather="filter" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                    Filtrer
                  </Button>
                </div>
              </div>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="table-responsive">
              <Table
                hover
                className={`align-middle ${theme === "dark" ? "table-dark" : ""}`}
                style={{ borderRadius: "8px", overflow: "hidden" }}
              >
                <thead className="table-primary">
                  <tr>
                    <th className="text-center" style={{ width: "50px" }}>
                      <Form.Check
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={Array.isArray(users) && checkedUsers.length === users.length && users.length > 0}
                      />
                    </th>
                    <th>
                      <i data-feather="user" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Utilisateur
                    </th>
                    <th className="d-none d-md-table-cell">
                      <i data-feather="mail" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Contact
                    </th>
                    <th className="d-none d-lg-table-cell">
                      <i data-feather="info" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Informations
                    </th>
                    <th className="text-center">
                      <i data-feather="shield" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Statuts
                    </th>
                    <th className="text-center">
                      <i data-feather="settings" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) && users.length ? (
                    users.map((user) => (
                      <tr key={user.id} className={theme === "dark" ? "border-secondary" : ""}>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            value={user.id}
                            checked={checkedUsers.includes(user.id)}
                            onChange={handleCheck}
                          />
                        </td>
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
                                {user.first_name} {user.last_name}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div>
                            <div className={`small ${theme === "dark" ? "text-light" : "text-dark"}`}>
                              <i data-feather="mail" className="me-1" style={{ width: "12px", height: "12px" }}></i>
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className={`small ${theme === "dark" ? "text-light" : "text-muted"}`}>
                                <i data-feather="phone" className="me-1" style={{ width: "12px", height: "12px" }}></i>
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <div>
                            <div className={`small ${theme === "dark" ? "text-light" : "text-dark"}`}>
                              ID: {user.id}
                            </div>
                            <div className={`small ${theme === "dark" ? "text-light" : "text-muted"}`}>
                              Créé le: {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column gap-1 align-items-center">
                            <Badge
                              bg={user.is_admin ? "success" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => handleToggleAdmin(user.id)}
                              title="Cliquer pour changer le statut admin"
                            >
                              <i
                                data-feather={user.is_admin ? "shield" : "user"}
                                className="me-1"
                                style={{ width: "12px", height: "12px" }}
                              ></i>
                              {user.is_admin ? "Admin" : "User"}
                            </Badge>
                            <Badge
                              bg={user.is_verified ? "warning" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => handleToggleVerified(user.id)}
                              title="Cliquer pour changer le statut vérifié"
                            >
                              <i
                                data-feather={user.is_verified ? "check-circle" : "x-circle"}
                                className="me-1"
                                style={{ width: "12px", height: "12px" }}
                              ></i>
                              {user.is_verified ? "Vérifié" : "Non vérifié"}
                            </Badge>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              title="Voir les détails"
                              as={Link}
                              to={`/admin/users/${user.id}`}
                            >
                              <i data-feather="eye" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              title="Modifier"
                              as={Link}
                              to={`/admin/users/${user.id}/edit`}
                            >
                              <i data-feather="edit" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              title="Supprimer"
                              onClick={() => confirmDelete(user.id)}
                            >
                              <i data-feather="trash-2" style={{ width: "14px", height: "14px" }}></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className={`${theme === "dark" ? "text-light" : "text-muted"}`}>
                          <i data-feather="users" className="mb-3" style={{ width: "48px", height: "48px", opacity: 0.5 }}></i>
                          <div>
                            <h6>Aucun utilisateur trouvé</h6>
                            <p className="small mb-0">
                              {Array.isArray(users) ? 
                                "Aucun utilisateur ne correspond à vos critères de recherche." : 
                                "Erreur lors du chargement des utilisateurs."}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Modale d'ajout */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
          size="lg"
          contentClassName={theme === "dark" ? "bg-dark text-light" : ""}
        >
          <Modal.Header className={theme === "dark" ? "bg-dark text-light border-secondary" : ""} closeButton>
            <Modal.Title>Créer un Nouvel Utilisateur</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className={theme === "dark" ? "bg-dark text-light" : ""}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom d'utilisateur *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Entrez le nom d'utilisateur"
                      required
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      isInvalid={!!errors.username}
                      className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                    />
                    <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Entrez l'adresse email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      isInvalid={!!errors.email}
                      className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Entrez le prénom"
                      value={form.first_name}
                      onChange={e => setForm({ ...form, first_name: e.target.value })}
                      className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Entrez le nom"
                      value={form.last_name}
                      onChange={e => setForm({ ...form, last_name: e.target.value })}
                      className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Entrez le numéro de téléphone"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Mot de Passe *</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Entrez le mot de passe"
                      required
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      isInvalid={!!errors.password}
                      className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Confirmer le Mot de Passe *</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirmez le mot de passe"
                      required
                      value={form.password2}
                      onChange={e => setForm({ ...form, password2: e.target.value })}
                      isInvalid={!!errors.password2}
                      className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password2}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      label="Administrateur"
                      checked={form.is_admin}
                      onChange={e => setForm({ ...form, is_admin: e.target.checked })}
                      className={theme === "dark" ? "text-light" : ""}
                    />
                    <Form.Check
                      type="checkbox"
                      label="Vérifié"
                      checked={form.is_verified}
                      onChange={e => setForm({ ...form, is_verified: e.target.checked })}
                      className={theme === "dark" ? "text-light" : ""}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Annuler</Button>
              <Button type="submit" variant="success">
                <i data-feather="save" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                Créer l'utilisateur
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modale de confirmation */}
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
            <p>Êtes-vous sûr de vouloir supprimer {userToDelete ? "cet utilisateur" : "ces utilisateurs"} ?</p>
            <div className="alert alert-warning">
              <i data-feather="alert-triangle" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Cette action est irréversible.
            </div>
          </Modal.Body>
          <Modal.Footer className={theme === "dark" ? "bg-dark text-light border-secondary" : ""}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
            <Button variant="danger" onClick={handleDeleteConfirmed}>
              <i data-feather="trash-2" className="me-2" style={{ width: "16px", height: "16px" }}></i>
              Supprimer
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Notifications Toast */}
        <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1050 }} >
          <Toast
            show={showToast}
            onClose={() => setShowToast(false)}
            delay={3000}
            autohide
            bg={toastType === 'success' ? 'success' : 'danger'}
            className={theme === "dark" ? "text-light" : "text-white"}
          >
            <Toast.Header
              closeButton={false}
              className={`${toastType === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}
            >
              <strong className="me-auto">
                <i data-feather={toastType === 'success' ? 'check-circle' : 'x-circle'} className="me-2" style={{ width: "16px", height: "16px" }}></i>
                Notification
              </strong>
            </Toast.Header>
            <Toast.Body className={theme === "dark" ? "bg-dark text-light" : ""}>
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </AdminLayout>
  );
}