import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataState from "../../components/DataState";
import Pagination from "../../components/Pagination";
import { getHistory } from "../../services/operatorOrderService";
import { getErrorMessage } from "../../utils/getErrorMessage";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-";
}

function History() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getHistory({ page })
      .then((result) => {
        if (cancelled) return;
        setOrders(result.data);
        setPagination(result.meta);
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
  }, [page, reloadKey]);

  function reload() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  function goToPage(newPage) {
    setPage(newPage);
    reload();
  }

  return (
    <div>
      <h1>Historique de mes ordres terminés</h1>

      <DataState
        loading={loading}
        error={error}
        isEmpty={orders.length === 0}
        emptyMessage="Aucun ordre terminé pour le moment."
        onRetry={reload}
      >
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Produits fabriqués</th>
                <th>Démarré le</th>
                <th>Terminé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.reference}</td>
                  <td>
                    <ul className="composition-list">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.product?.name ?? "Produit supprimé"} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{formatDate(order.startedAt)}</td>
                  <td>{formatDate(order.finishedAt)}</td>
                  <td className="actions">
                    <Link to={`/operator/orders/${order._id}`}>Détail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={pagination?.totalPages}
          onPageChange={goToPage}
        />
      </DataState>
    </div>
  );
}

export default History;