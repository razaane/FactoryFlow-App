import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import DataState from "../../components/DataState";
import OrderEditor from "../../components/OrderEditor";
import StatusBadge from "../../components/StatusBadge";
import {
  cancelOrder,
  getOrder,
  updateOrder
} from "../../services/orderService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { calculateRequirements } from "../../utils/requirements";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-";
}

function OrderDetail() {
  const { id } = useParams(); // paramètre de route dynamique
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [message, setMessage] = useState(location.state?.message ?? "");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getOrder(id)
      .then((data) => {
        if (!cancelled) setOrder(data);
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
  }, [id, reloadKey]);

  // besoins calculés sur la composition COPIÉE à la création de l'ordre
  const requirements = useMemo(
    () => (order ? calculateRequirements(order.items) : []),
    [order]
  );

  // rafraîchir après une mutation
  function reload() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  // FP-113: modification
  async function handleUpdate(payload) {
    await updateOrder(id, payload);
    setEditing(false);
    setMessage("Ordre modifié.");
    reload();
  }

  // FP-114: annulation après confirmation
  async function handleCancel() {
    setActionError("");

    try {
      await cancelOrder(id);
      setMessage("Ordre annulé.");
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setConfirmingCancel(false);
    }
  }

  const initialValues = order
    ? {
        items: order.items.map((item) => ({
          product: item.product?._id ?? item.product,
          quantity: String(item.quantity)
        })),
        assignedTo: order.assignedTo?._id ?? ""
      }
    : null;

  return (
    <div>
      <p><Link to="/admin/orders">← Retour aux ordres</Link></p>

      <DataState loading={loading} error={error} onRetry={reload}>
        {order && (
          <>
            <div className="page-header">
              <h1>
                {order.reference} <StatusBadge status={order.status} />
              </h1>

              {order.status === "PLANIFIE" && !editing && (
                <div className="actions">
                  <button type="button" onClick={() => setEditing(true)}>
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => setConfirmingCancel(true)}
                  >
                    Annuler l'ordre
                  </button>
                </div>
              )}
            </div>

            {message && <p className="success" role="status">{message}</p>}
            {actionError && <p className="error" role="alert">{actionError}</p>}

            {confirmingCancel && (
              <div className="inline-confirm" role="alertdialog">
                <span>Annuler définitivement cet ordre ?</span>
                <button type="button" className="btn-danger" onClick={handleCancel}>
                  Oui, annuler
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setConfirmingCancel(false)}
                >
                  Non
                </button>
              </div>
            )}

            <div className="panel info-grid">
              <div><strong>Opérateur</strong><br />{order.assignedTo?.name ?? "-"}</div>
              <div><strong>Créé par</strong><br />{order.createdBy?.name ?? "-"}</div>
              <div><strong>Créé le</strong><br />{formatDate(order.createdAt)}</div>
              <div><strong>Démarré le</strong><br />{formatDate(order.startedAt)}</div>
              <div><strong>Terminé le</strong><br />{formatDate(order.finishedAt)}</div>
              <div><strong>Annulé le</strong><br />{formatDate(order.cancelledAt)}</div>
            </div>

            {editing && (
              <OrderEditor
                title="Modifier l'ordre"
                submitLabel="Enregistrer"
                initialValues={initialValues}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(false)}
              />
            )}

            <h2>Produits de l'ordre</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Composition (par unité)</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.name ?? "Produit supprimé"}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <ul className="composition-list">
                          {item.composition.map((line, i) => (
                            <li key={i}>
                              {line.material?.name ?? "Matière supprimée"} : {line.quantity}{" "}
                              {line.material?.unit ?? ""}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Besoins totaux en matières</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Quantité requise</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td>{requirement.name}</td>
                      <td>{requirement.quantity} {requirement.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DataState>
    </div>
  );
}

export default OrderDetail;