import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataState from "../../components/DataState";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import { getMyOrders } from "../../services/operatorOrderService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { STATUS_LABELS } from "../../utils/status";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getMyOrders({ page, status })
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
  }, [page, status, reloadKey]);

  function reload() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(1);
    reload();
  }

  function goToPage(newPage) {
    setPage(newPage);
    reload();
  }

  return (
    <div>
      <h1>Mes ordres</h1>

      <div className="toolbar">
        <label htmlFor="status">Statut</label>
        <select id="status" value={status} onChange={handleStatusChange}>
          <option value="">Tous</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <DataState
        loading={loading}
        error={error}
        isEmpty={orders.length === 0}
        emptyMessage={
          status
            ? "Aucun ordre avec ce statut."
            : "Aucun ordre ne vous est affecté pour le moment."
        }
        onRetry={reload}
      >
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Produits à fabriquer</th>
                <th>Statut</th>
                <th>Créé le</th>
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
                  <td><StatusBadge status={order.status} /></td>
                  <td>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
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

export default MyOrders;