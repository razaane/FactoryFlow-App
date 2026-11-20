const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "L'email est obligatoire";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Email invalide";
  }

  if (!password) {
    errors.password = "Le mot de passe est obligatoire";
  }

  return errors;
}

export function validateInstallation({ name, email, password, confirmPassword }) {
  const errors = validateLogin({ email, password });

  if (!name.trim()) {
    errors.name = "Le nom est obligatoire";
  }

  if (!errors.password && password.length < 8) {
    errors.password = "Au moins 8 caractères";
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
  }

  return errors;
}