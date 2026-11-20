// Transforme une erreur Axios en message lisible pour l'interface
export function getErrorMessage(error) {
  if (error.response) {
    return error.response.data?.message || `Erreur ${error.response.status}`;
  }

  if (error.request) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  }

  return "Une erreur est survenue. Réessayez.";
}