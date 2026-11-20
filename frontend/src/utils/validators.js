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

export const UNITS = ["kg", "g", "L", "mL", "unité", "m"];

function isNonNegativeNumber(value) {
  return value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
}

export function validateMaterial(values, isCreate) {
  const errors = {};

  if (!values.reference.trim()) {
    errors.reference = "La référence est obligatoire";
  }

  if (values.name.trim().length < 2) {
    errors.name = "Le nom doit contenir au moins 2 caractères";
  }

  if (!UNITS.includes(values.unit)) {
    errors.unit = "Unité invalide";
  }

  if (!isNonNegativeNumber(values.alertThreshold)) {
    errors.alertThreshold = "Le seuil doit être un nombre supérieur ou égal à 0";
  }

  if (isCreate && !isNonNegativeNumber(values.stockInitial)) {
    errors.stockInitial = "Le stock initial doit être un nombre supérieur ou égal à 0";
  }

  return errors;
}

// retourne un message d'erreur, ou "" si la quantité est valide
export function validateStockEntry(quantity) {
  const value = Number(quantity);

  if (quantity === "" || !Number.isFinite(value) || value <= 0) {
    return "La quantité doit être strictement positive";
  }

  return "";
}

// values.composition = [{ material: "id", quantity: "2.5" }]
export function validateProduct(values) {
  const errors = {};
  const lines = values.composition;

  if (!values.reference.trim()) {
    errors.reference = "La référence est obligatoire";
  }

  if (!values.name.trim()) {
    errors.name = "Le nom est obligatoire";
  }

  if (lines.length === 0) {
    errors.composition = "Ajoutez au moins une matière première";
  } else if (lines.some((line) => !line.material)) {
    errors.composition = "Choisissez une matière pour chaque ligne";
  } else if (new Set(lines.map((line) => line.material)).size !== lines.length) {
    errors.composition = "Une matière ne peut pas apparaître deux fois";
  } else if (
    lines.some(
      (line) =>
        line.quantity === "" ||
        !Number.isFinite(Number(line.quantity)) ||
        Number(line.quantity) <= 0
    )
  ) {
    errors.composition = "Chaque quantité doit être strictement positive";
  }

  return errors;
}