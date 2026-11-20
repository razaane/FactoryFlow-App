// Transforme une erreur Axios en message lisible pour l'interface
export function getErrorMessage(error) {
  if (error.response) {
    const data = error.response.data;

    // le backend peut envoyer une liste de détails (ex: validation produit)
    if (Array.isArray(data?.details) && data.details.length > 0) {
      return `${data.message} : ${data.details.join(", ")}`;
    }

    return data?.message || `Erreur ${error.response.status}`;
  }

  if (error.request) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  }

  return "Une erreur est survenue. Réessayez.";
}