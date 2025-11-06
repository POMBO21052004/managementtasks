import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import feather from "feather-icons";

const Login = () => {
  const [step, setStep] = useState(1); // 1: Email/Mot de passe, 2: OTP
  const [form, setForm] = useState({ email: "", password: "", otp_code: "" });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
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
  }, [theme, error, isLoading, step]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    setError(null);
  };

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      setStep(2); // Passer à l'étape OTP
    } catch (err) {
      const response = err.response;
      if (response?.status === 422 && response.data?.errors) {
        setFieldErrors(response.data.errors);
      } else {
        setError(response?.data?.message || "Erreur de connexion");
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
      const res = await api.post("/auth/verify-otp", {
        email: form.email,
        otp_code: form.otp_code
      });
      
      const { token, user, tokens } = res.data;
      login(user, tokens.access);
      
      // Redirection en fonction du rôle
      if (user.is_admin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/employe/dashboard");
      }
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
      await api.post("/auth/resend-otp", { email: form.email });
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
          <Col xl={5} lg={6} md={8} sm={10}>
            {/* En-tête avec logo */}
            <div className="text-center mb-4">
              <h1 className={`h3 fw-bold mb-2 ${
                theme === "dark" ? "text-light" : "text-dark"
              }`}>
                <i data-feather="check-circle" className="text-primary me-2" style={{ width: "24px", height: "24px" }}></i>
                Task Manager
              </h1>
              <p className={`mb-0 ${theme === "dark" ? "text-light" : "text-muted"}`}>
                Gérez vos tâches efficacement
              </p>
              <div className="d-flex justify-content-center align-items-center mt-2">
                <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill">
                  <i data-feather="shield" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                  Authentification sécurisée
                </div>
              </div>
            </div>

            {/* Carte principale de connexion */}
            <Card className={`shadow-lg border-0 overflow-hidden ${
              theme === "dark" ? "bg-dark" : "bg-white"
            }`}>
              {/* Barre de progression */}
              <div className="bg-primary" style={{ height: "4px" }}></div>
              
              <Card.Header className={`text-center py-4 border-0 ${
                theme === "dark" ? "bg-dark" : "bg-white"
              }`}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className={`mb-1 fw-bold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                      {step === 1 ? "Connexion" : "Vérification OTP"}
                    </h4>
                    <small className={theme === "dark" ? "text-light" : "text-muted"}>
                      {step === 1 ? "Accédez à votre espace" : "Entrez le code de vérification"}
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
                {/* Alerte d'erreur */}
                {error && (
                  <Alert variant="danger" className="d-flex align-items-start mb-4">
                    <i data-feather="alert-circle" className="text-danger me-2 mt-1" style={{ width: "18px", height: "18px" }}></i>
                    <div>
                      <strong>Erreur</strong>
                      <div className="small mt-1">{error}</div>
                    </div>
                  </Alert>
                )}

                {/* Étape 1: Email et mot de passe */}
                {step === 1 && (
                  <Form onSubmit={handleEmailPasswordSubmit} className="needs-validation" noValidate>
                    {/* Email */}
                    <Form.Group className="mb-4">
                      <Form.Label className={`fw-semibold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        <i data-feather="mail" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                        Adresse email
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
                          <i data-feather="user" className={`${
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

                    {/* Mot de passe */}
                    <Form.Group className="mb-4">
                      <Form.Label className={`fw-semibold ${theme === "dark" ? "text-light" : "text-dark"}`}>
                        <i data-feather="lock" className="me-2" style={{ width: "16px", height: "16px" }}></i>
                        Mot de passe
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
                      {fieldErrors.password && (
                        <Form.Control.Feedback type="invalid" className="d-block">
                          <i data-feather="x-circle" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                          {fieldErrors.password}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    {/* Options */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check
                        type="checkbox"
                        id="remember-me"
                        label="Se souvenir de moi"
                        className={theme === "dark" ? "text-light" : "text-dark"}
                      />
                      {/* <Link 
                        to="/forgot-password" 
                        className="text-primary text-decoration-none small fw-semibold"
                      >
                        <i data-feather="help-circle" className="me-1" style={{ width: "14px", height: "14px" }}></i>
                        Mot de passe oublié ?
                      </Link> */}
                    </div>

                    {/* Bouton de connexion */}
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      className="w-100 py-3 fw-semibold text-white border-0 position-relative"
                      style={{
                        background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                        boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)"
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          Se connecter
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
                          Vérifier le code
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
                {/* {step === 1 && (
                  <>
                    <div className="text-center my-4">
                      <hr className={theme === "dark" ? "border-secondary" : ""} />
                      <span className={`px-3 small ${theme === "dark" ? "bg-dark text-light" : "bg-white text-muted"}`}>
                        Nouveau sur Task Manager ?
                      </span>
                    </div>

                    <div className="text-center">
                      <Link 
                        to="/register" 
                        className="btn btn-outline-primary w-100 py-3 fw-semibold"
                      >
                        <i data-feather="user-plus" className="me-2" style={{ width: "18px", height: "18px" }}></i>
                        Créer un compte
                      </Link>
                    </div>
                  </>
                )} */}
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

export default Login;