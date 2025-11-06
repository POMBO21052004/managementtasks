import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ProgressBar } from "react-bootstrap";
import api from "../../services/api";
import feather from "feather-icons";

const Register = () => {
  const [step, setStep] = useState(1); // 1: Inscription, 2: Vérification OTP
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    otp_code: ""
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Détection du thème
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
  
  // Initialisation des icônes Feather
  useEffect(() => {
    feather.replace();
  }, [theme, error, isLoading, successMessage, step]);

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return "danger";
    if (strength < 50) return "warning";
    if (strength < 75) return "info";
    return "success";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return "Très faible";
    if (strength < 50) return "Faible";
    if (strength < 75) return "Moyen";
    return "Fort";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: null });
    setError(null);

    // Calculer la force du mot de passe
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validation des conditions d'utilisation
    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation
      });
      setStep(2); // Passer à l'étape OTP
    } catch (err) {
      const response = err.response;
      if (response?.status === 422 && response.data?.errors) {
        setFieldErrors(response.data.errors);
      } else {
        setError(response?.data?.message || "Une erreur s'est produite lors de l'inscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await api.post("/verify-otp", {
        email: form.email,
        otp_code: form.otp_code
      });
      
      setSuccessMessage("Inscription réussie ! Redirection vers la connexion...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const response = err.response;
      if (response?.status === 422 && response.data?.errors) {
        setFieldErrors(response.data.errors);
      } else {
        setError(response?.data?.message || "Code OTP invalide");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post("/resend-otp", { email: form.email });
      setError(null);
      // Optionnel: Afficher un message de succès
    } catch (err) {
      setError("Erreur lors de l'envoi du code OTP");
    }
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <div className={`min-vh-100 d-flex align-items-center py-4 ${
      theme === "dark" 
        ? "bg-dark" 
        : "bg-light"
    }`} style={{
      background: theme === "dark" 
        ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
        : "linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 50%, #e8f5e8 100%)"
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col xl={6} lg={7} md={9} sm={11}>
            {/* En-tête avec logo */}
            <div className="text-center mb-4">
              <h1 className={`h3 fw-bold mb-2 ${
                theme === "dark" ? "text-light" : "text-dark"
              }`}>
                <i data-feather="check-circle" className="text-primary me-2" style={{ width: "24px", height: "24px" }}></i>
                Task Manager
              </h1>
              <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
                Créez votre compte pour gérer vos tâches
              </p>
              <div className="d-flex justify-content-center align-items-center mt-2">
                <div className="badge bg-info bg-opacity-10 text-info px-3 py-1 rounded-pill">
                  <i data-feather="users" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                  Rejoignez notre communauté
                </div>
              </div>
            </div>

            {/* Carte principale d'inscription */}
            <Card className={`shadow-lg border-0 overflow-hidden ${
              theme === "dark" ? "bg-dark" : "bg-white"
            }`}>
              {/* Barre de progression */}
              <div className="bg-success" style={{ height: "4px" }}></div>
              
              <Card.Header className={`text-center py-4 border-0 ${
                theme === "dark" ? "bg-dark" : "bg-white"
              }`}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className={`mb-1 fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                      {step === 1 ? "Inscription" : "Vérification OTP"}
                    </h4>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      {step === 1 ? "Créez votre compte" : "Finalisez votre inscription"}
                    </small>
                  </div>
                  <Button
                    variant={theme === "dark" ? "outline-light" : "outline-secondary"}
                    size="sm"
                    onClick={toggleTheme}
                    className="rounded-circle p-2"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i data-feather={theme === "dark" ? "sun" : "moon"} style={{ width: "16px", height: "16px" }}></i>
                  </Button>
                </div>
              </Card.Header>

              <Card.Body className={`p-4 ${theme === "dark" ? "bg-dark" : "bg-white"}`}>
                {/* Alertes d'erreur */}
                {error && (
                  <Alert variant="danger" className="d-flex align-items-start mb-4">
                    <i data-feather="alert-circle" className="text-danger me-2 mt-1" style={{ width: "18px", height: "18px" }}></i>
                    <div>
                      <strong>Erreur</strong>
                      <div className="small mt-1">{error}</div>
                    </div>
                  </Alert>
                )}

                {/* Message de succès */}
                {successMessage && (
                  <Alert variant="success" className="d-flex align-items-start mb-4">
                    <i data-feather="check-circle" className="text-success me-2 mt-1" style={{ width: "18px", height: "18px" }}></i>
                    <div>
                      <strong>Inscription réussie !</strong>
                      <div className="small mt-1">{successMessage}</div>
                    </div>
                  </Alert>
                )}

                {/* Étape 1: Formulaire d'inscription */}
                {step === 1 && (
                  <Form onSubmit={handleRegisterSubmit} className="needs-validation" noValidate>
                    <Row className="g-4">
                      {/* Nom d'utilisateur */}
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className={`fw-semibold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                            <i data-feather="user" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                            Nom d'utilisateur *
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type="text"
                              name="username"
                              placeholder="Votre nom d'utilisateur"
                              value={form.username}
                              onChange={handleChange}
                              onFocus={() => setFocusedField('username')}
                              onBlur={() => setFocusedField(null)}
                              isInvalid={!!fieldErrors.username}
                              className={`py-3 ps-5 ${
                                theme === "dark" ? "bg-dark text-light border-secondary" : "bg-light"
                              } ${focusedField === 'username' ? 'border-primary shadow-sm' : ''}`}
                              required
                            />
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                              <i data-feather="user" className={`${
                                focusedField === 'username' ? 'text-primary' : (theme === "dark" ? 'text-light' : 'text-muted')
                              }`} style={{ width: "18px", height: "18px" }}></i>
                            </div>
                          </div>
                          {fieldErrors.username && (
                            <Form.Control.Feedback type="invalid" className="d-block">
                              <i data-feather="x-circle" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                              {fieldErrors.username}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>

                      {/* Email */}
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className={`fw-semibold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                            <i data-feather="mail" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                            Adresse email *
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type="email"
                              name="email"
                              placeholder="votre@email.com"
                              value={form.email}
                              onChange={handleChange}
                              onFocus={() => setFocusedField('email')}
                              onBlur={() => setFocusedField(null)}
                              isInvalid={!!fieldErrors.email}
                              className={`py-3 ps-5 ${
                                theme === "dark" ? "bg-dark text-light border-secondary" : "bg-light"
                              } ${focusedField === 'email' ? 'border-primary shadow-sm' : ''}`}
                              required
                            />
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                              <i data-feather="at-sign" className={`${
                                focusedField === 'email' ? 'text-primary' : (theme === "dark" ? 'text-light' : 'text-muted')
                              }`} style={{ width: "18px", height: "18px" }}></i>
                            </div>
                          </div>
                          {fieldErrors.email && (
                            <Form.Control.Feedback type="invalid" className="d-block">
                              <i data-feather="x-circle" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                              {fieldErrors.email}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>

                      {/* Mot de passe */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className={`fw-semibold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                            <i data-feather="lock" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                            Mot de passe *
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              name="password"
                              placeholder="••••••••"
                              value={form.password}
                              onChange={handleChange}
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField(null)}
                              isInvalid={!!fieldErrors.password}
                              className={`py-3 ps-5 pe-5 ${
                                theme === "dark" ? "bg-dark text-light border-secondary" : "bg-light"
                              } ${focusedField === 'password' ? 'border-primary shadow-sm' : ''}`}
                              required
                            />
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                              <i data-feather="key" className={`${
                                focusedField === 'password' ? 'text-primary' : (theme === "dark" ? 'text-light' : 'text-muted')
                              }`} style={{ width: "18px", height: "18px" }}></i>
                            </div>
                            <Button
                              variant="link"
                              className="position-absolute top-50 end-0 translate-middle-y border-0 text-decoration-none p-0 pe-3"
                              onClick={() => setShowPassword(!showPassword)}
                              type="button"
                            >
                              <i data-feather={showPassword ? "eye-off" : "eye"} className={
                                theme === "dark" ? "text-light" : "text-muted"
                              } style={{ width: "18px", height: "18px" }}></i>
                            </Button>
                          </div>
                          
                          {/* Indicateur de force du mot de passe */}
                          {form.password && (
                            <div className="mt-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className={theme === "dark" ? "text-light" : "text-muted"}>
                                  Force du mot de passe:
                                </small>
                                <small className={`text-${getPasswordStrengthColor(passwordStrength)}`}>
                                  {getPasswordStrengthText(passwordStrength)}
                                </small>
                              </div>
                              <ProgressBar 
                                now={passwordStrength} 
                                variant={getPasswordStrengthColor(passwordStrength)}
                                style={{ height: "6px" }}
                              />
                            </div>
                          )}

                          {fieldErrors.password && (
                            <Form.Control.Feedback type="invalid" className="d-block">
                              <i data-feather="x-circle" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                              {fieldErrors.password}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>

                      {/* Confirmation mot de passe */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className={`fw-semibold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                            <i data-feather="shield" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                            Confirmer le mot de passe *
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type={showConfirmPassword ? "text" : "password"}
                              name="password_confirmation"
                              placeholder="••••••••"
                              value={form.password_confirmation}
                              onChange={handleChange}
                              onFocus={() => setFocusedField('password_confirmation')}
                              onBlur={() => setFocusedField(null)}
                              isInvalid={!!fieldErrors.password_confirmation}
                              className={`py-3 ps-5 pe-5 ${
                                theme === "dark" ? "bg-dark text-light border-secondary" : "bg-light"
                              } ${focusedField === 'password_confirmation' ? 'border-primary shadow-sm' : ''}`}
                              required
                            />
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                              <i data-feather="check-circle" className={`${
                                focusedField === 'password_confirmation' ? 'text-primary' : (theme === "dark" ? 'text-light' : 'text-muted')
                              }`} style={{ width: "18px", height: "18px" }}></i>
                            </div>
                            <Button
                              variant="link"
                              className="position-absolute top-50 end-0 translate-middle-y border-0 text-decoration-none p-0 pe-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              type="button"
                            >
                              <i data-feather={showConfirmPassword ? "eye-off" : "eye"} className={
                                theme === "dark" ? "text-light" : "text-muted"
                              } style={{ width: "18px", height: "18px" }}></i>
                            </Button>
                          </div>
                          {fieldErrors.password_confirmation && (
                            <Form.Control.Feedback type="invalid" className="d-block">
                              <i data-feather="x-circle" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                              {fieldErrors.password_confirmation}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Conseils de sécurité */}
                    <div className={`mt-4 p-3 rounded-3 ${
                      theme === "dark" ? "bg-info bg-opacity-10" : "bg-info bg-opacity-10"
                    }`}>
                      <div className="d-flex align-items-start">
                        <i data-feather="info" className="text-info me-2 mt-1" style={{ width: "16px", height: "16px" }}></i>
                        <div>
                          <small className={`fw-semibold text-info`}>Conseils pour un mot de passe sécurisé :</small>
                          <ul className={`small mb-0 mt-1 ${theme === "dark" ? "text-light" : "text-muted"}`}>
                            <li>Au moins 8 caractères</li>
                            <li>Majuscules et minuscules</li>
                            <li>Au moins un chiffre</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Conditions d'utilisation */}
                    <div className="mt-4">
                      <Form.Check
                        type="checkbox"
                        id="accept-terms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        label={
                          <span className={theme === "dark" ? "text-light" : "text-dark"}>
                            J'accepte les{' '}
                            <Link to="/conditions" className="text-primary text-decoration-none fw-semibold">
                              conditions d'utilisation
                            </Link>
                            {' '}et la{' '}
                            <Link to="/confidentialite" className="text-primary text-decoration-none fw-semibold">
                              charte de vie privée
                            </Link>
                          </span>
                        }
                        className="user-select-none"
                        required
                      />
                    </div>

                    {/* Bouton d'inscription */}
                    <Button
                      type="submit"
                      variant="success"
                      disabled={isLoading || !acceptTerms}
                      className="w-100 py-3 fw-semibold text-white border-0 mt-4 position-relative"
                      style={{
                        background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                        boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)"
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Création du compte...
                        </>
                      ) : (
                        <>
                          Créer mon compte
                        </>
                      )}
                    </Button>
                  </Form>
                )}

                {/* Étape 2: Vérification OTP */}
                {step === 2 && (
                  <Form onSubmit={handleOTPSubmit} className="needs-validation" noValidate>
                    {/* Instructions */}
                    <div className={`mb-4 p-3 rounded-3 ${
                      theme === "dark" ? "bg-info bg-opacity-10" : "bg-info bg-opacity-10"
                    }`}>
                      <div className="d-flex align-items-start">
                        <i data-feather="mail" className="text-info me-2 mt-1" style={{ width: "16px", height: "16px" }}></i>
                        <div>
                          <small className={`fw-semibold text-info`}>Vérification en deux étapes</small>
                          <div className={`small mt-1 ${theme === "dark" ? "text-light" : "text-muted"}`}>
                            Un code de vérification a été envoyé à <strong>{form.email}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Code OTP */}
                    <Form.Group className="mb-4">
                      <Form.Label className={`fw-semibold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        <i data-feather="shield" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                        Code de vérification
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          name="otp_code"
                          placeholder="123456"
                          value={form.otp_code}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('otp_code')}
                          onBlur={() => setFocusedField(null)}
                          isInvalid={!!fieldErrors.otp_code}
                          className={`py-3 ps-5 ${
                            theme === "dark" ? "bg-dark text-light border-secondary" : "bg-light"
                          } ${focusedField === 'otp_code' ? 'border-primary shadow-sm' : ''}`}
                          required
                          maxLength={6}
                        />
                        <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                          <i data-feather="key" className={`${
                            focusedField === 'otp_code' ? 'text-primary' : (theme === "dark" ? 'text-light' : 'text-muted')
                          }`} style={{ width: "18px", height: "18px" }}></i>
                        </div>
                      </div>
                      {fieldErrors.otp_code && (
                        <Form.Control.Feedback type="invalid" className="d-block">
                          <i data-feather="x-circle" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                          {fieldErrors.otp_code}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    {/* Bouton renvoyer OTP */}
                    <div className="text-center mb-4">
                      <Button
                        variant="link"
                        onClick={handleResendOTP}
                        className="text-primary text-decoration-none"
                      >
                        <i data-feather="refresh-cw" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                        Renvoyer le code
                      </Button>
                    </div>

                    {/* Bouton de vérification */}
                    <Button
                      type="submit"
                      variant="success"
                      disabled={isLoading}
                      className="w-100 py-3 fw-semibold text-white border-0 position-relative"
                      style={{
                        background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                        boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)"
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          Finaliser l'inscription
                        </>
                      )}
                    </Button>

                    {/* Bouton retour */}
                    <Button
                      variant="outline-secondary"
                      onClick={() => setStep(1)}
                      className="w-100 mt-3 py-3"
                    >
                      <i data-feather="arrow-left" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                      Retour
                    </Button>
                  </Form>
                )}

                {/* Séparateur - seulement à l'étape 1 */}
                {step === 1 && (
                  <>
                    <div className="text-center my-4">
                      <hr className={theme === "dark" ? "border-secondary" : ""} />
                      <span className={`px-3 small ${theme === "dark" ? "bg-dark text-light" : "bg-white text-muted"}`}>
                        Déjà inscrit ?
                      </span>
                    </div>

                    {/* Lien de connexion */}
                    <div className="text-center">
                      <Link 
                        to="/login" 
                        className="btn btn-outline-primary w-100 py-3 fw-semibold"
                      >
                        <i data-feather="log-in" className="me-2" style={{ width: "18px", height: "18px" }}></i>
                        Se connecter
                      </Link>
                    </div>
                  </>
                )}
              </Card.Body>

              {/* Footer de la carte */}
              <Card.Footer className={`text-center py-3 border-0 ${
                theme === "dark" ? "bg-dark" : "bg-light"
              }`}>
                <div className="d-flex align-items-center justify-content-center">
                  <i data-feather="shield" className="text-success me-2" style={{ width: "16px", height: "16px" }}></i>
                  <small className={`fw-semibold ${theme === "dark" ? "text-light" : "text-muted"}`}>
                    Authentification sécurisée à deux facteurs
                  </small>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;