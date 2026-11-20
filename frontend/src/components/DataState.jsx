function DataState({ loading, error, isEmpty, emptyMessage, onRetry, children }) {
  if (loading) {
    return <p className="center-text">Chargement...</p>;
  }

  if (error) {
    return (
      <div className="error" role="alert">
        <p>{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return <p className="empty">{emptyMessage || "Aucune donnée."}</p>;
  }

  return children;
}

export default DataState;