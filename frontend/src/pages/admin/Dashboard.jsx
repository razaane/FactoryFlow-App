import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataState from "../../components/DataState";
import { getDashboard } from "../../services/dashboardService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { STATUS_LABELS } from "../../utils/status";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getDashboard()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function reload() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  return (
    <div>
      <h1>Tableau de bord</h1>

      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            {/* FP-119: cartes de totaux */}
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-value">{data.totalProducts}</div>
                <div>Produits</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{data.totalMaterials}</div>
                <div>Matières premières</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{data.totalOrders}</div>
                <div>Ordres de fabrication</div>
              </div>
            </div>

            {/* FP-120: répartition par statut */}
            <div className="panel">
              <h2>Ordres par statut</h2>

              {Object.entries(STATUS_LABELS).map(([status, label]) => {
                const count = data.ordersByStatus[status] ?? 0;
                const percent =
                  data.totalOrders > 0
                    ? Math.round((count / data.totalOrders) * 100)
                    : 0;

                return (
                  <div className="bar-row" key={status}>
                    <span>{label}</span>
                    <div
                      className="bar-track"
                      role="img"
                      aria-label={`${label} : ${count} ordre(s)`}
                    >
                      <div className="bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>

            {/* FP-121: alertes de seuil */}
            <div className="panel">
              <h2>Matières sous leur seuil d'alerte</h2>

              {data.lowStockMaterials.length === 0 ? (
                <p className="empty">Aucune matière sous son seuil.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Nom</th>
                        <th>Stock</th>
                        <th>Seuil</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStockMaterials.map((material) => (
                        <tr key={material._id}>
                          <td>{material.reference}</td>
                          <td>{material.name}</td>
                          <td className="stock-low">{material.stock} {material.unit}</td>
                          <td>{material.alertThreshold} {material.unit}</td>
                          <td>
                            <Link to={`/admin/materials/${material._id}`}>Réapprovisionner</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </DataState>
    </div>
  );
}

export default Dashboard;