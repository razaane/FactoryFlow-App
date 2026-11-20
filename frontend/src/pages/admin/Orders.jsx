import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataState from "../../components/DataState";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import { getOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { STATUS_LABELS } from "../../utils/status";

const EMPTY_FILTERS = { search: "", status: "", product: "", from: "", to: "" };

function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState(EMPTY_FILTERS); // valeurs saisies
  const [filters, setFilters] = useState(EMPTY_FILTERS); // filtres appliqués
  const [filterError, setFilterError] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // produits pour le filtre
  useEffect(() => {
    getProducts({ limit: 100 })
      .then((result) => setProducts(result.data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    getOrders({ page, ...filters })
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
  }, [page, filters, reloadKey]);

  function reload() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  function handleDraftChange(event) {
    setDraft({ ...draft, [event.target.name]: event.target.value });
  }

  function handleFilter(event) {
    event.preventDefault();

    if (draft.from && draft.to && draft.from > draft.to) {
      setFilterError("La date de début doit être antérieure à la date de fin");
      return;
    }

    setFilterError("");
    setPage(1);
    setFilters({ ...draft, search: draft.search.trim() });
    reload();
  }

  function handleReset() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setFilterError("");
    setPage(1);
    reload();
  }

  function goToPage(newPage) {
    setPage(newPage);
    reload();
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="page-header">
        <h1>Ordres de fabrication</h1>
        <Link className="button-link" to="/admin/orders/new">
          Nouvel ordre
        </Link>
      </div>

      <form className="panel" onSubmit={handleFilter}>
        <div className="filters">
          <div>
            <label htmlFor="search">Référence</label>
            <input id="search" name="search" placeholder="OF-..." value={draft.search} onChange={handleDraftChange} />
          </div>

          <div>
            <label htmlFor="status">Statut</label>
            <select id="status" name="status" value={draft.status} onChange={handleDraftChange}>
              <option value="">Tous</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product">Produit</label>
            <select id="product" name="product" value={draft.product} onChange={handleDraftChange}>
              <option value="">Tous</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>{product.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="from">Du</label>
            <input id="from" name="from" type="date" value={draft.from} onChange={handleDraftChange} />
          </div>

          <div>
            <label htmlFor="to">Au</label>
            <input id="to" name="to" type="date" value={draft.to} onChange={handleDraftChange} />
          </div>
        </div>

        {filterError && <p className="error" role="alert">{filterError}</p>}

        <div className="form-actions">
          <button type="submit">Filtrer</button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Réinitialiser
          </button>
        </div>
      </form>

      <DataState
        loading={loading}
        error={error}
        isEmpty={orders.length === 0}
        emptyMessage={
          hasFilters
            ? "Aucun ordre ne correspond aux filtres."
            : "Aucun ordre de fabrication pour le moment."
        }
        onRetry={reload}
      >
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Produits</th>
                <th>Opérateur</th>
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
                  <td>{order.assignedTo?.name ?? "-"}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="actions">
                    <Link to={`/admin/orders/${order._id}`}>Détail</Link>
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

export default Orders;