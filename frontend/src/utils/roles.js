export const ROLES = {
  ADMIN: "Admin",
  OPERATOR: "Operateur"
};

// page d'accueil de chaque rôle
export function getHomePath(role) {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.OPERATOR) return "/operator";
  return "/login";
}