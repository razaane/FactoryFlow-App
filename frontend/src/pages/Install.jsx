import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInstallationStatus,
  installApp
} from "../services/installationService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { validateInstallation } from "../utils/validators";

function Install() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  // si l'app est déjà installée, on va à la connexion
  useEffect(() => {
    let cancelled = false;

    getInstallationStatus()
      .then((status) => {
        if (cancelled) return;

        if (status.installed) {
          navigate("/login", { replace: true });
        } else {
          setChecking(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setServerError(getErrorMessage(err));
        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const validationErrors = validateInstallation(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      await installApp({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      navigate("/login", {
        replace: true,
        state: { message: "Installation terminée. Connectez-vous avec le compte Admin." }
      });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <p className="center-text">Chargement...</p>;
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit} noValidate>
        <h1>Installation</h1>
        <p>Créez le premier compte Administrateur.</p>

        {serverError && <p className="error" role="alert">{serverError}</p>}

        <label htmlFor="name">Nom</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="field-error">{errors.name}</span>}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        {errors.email && <span className="field-error">{errors.email}</span>}

        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
        {errors.password && <span className="field-error">{errors.password}</span>}

        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
        <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}

        <button type="submit" disabled={loading}>
          {loading ? "Installation..." : "Installer"}
        </button>
      </form>
    </div>
  );
}

export default Install;