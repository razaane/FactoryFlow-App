import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DataState from "../../components/DataState";
import StatusBadge from "../../components/StatusBadge";
import {
  finishOrder,
  getMyOrder,
  startOrder
} from "../../services/operatorOrderService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { calculateRequirements } from "../../utils/requirements";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-";
}

function OperatorOrderDetail() {
  const { id } = useParams(); // paramètre de route dynamique

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmingStart, setConfirmingStart] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getMyOrder(id)
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

  // besoins totaux de l'ordre (additionnés par matière)
  const requirements = useMemo(
    () => (order ? calculateRequirements(order.items) : []),
    [order]
  );

  function reload() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  // applique la réponse de l'API: le statut change immédiatement à l'écran
  function applyUpdate(updated) {
    setOrder((current) => ({
      ...current,
      status: updated.status,
      startedAt: updated.startedAt,
      finishedAt: updated.finishedAt
    }));
  }

  // FP-116: démarrage (après confirmation)
  async function handleStart() {
    setActionError("");
    setMessage("");
    setWorking(true);

    try {
      const updated = await startOrder(id);
      applyUpdate(updated);
      setMessage("Ordre démarré : les matières ont été déduites du stock.");
    } catch (err) {
      const text = getErrorMessage(err);

      // le backend a répondu par un refus: rien n'a été déduit
      setActionError(
        err.response
          ? `${text}. L'ordre n'a pas été démarré : aucun stock n'a été déduit.`
          : text
      );
    } finally {
      setWorking(false);
      setConfirmingStart(false);
    }
  }

  // FP-117: fin d'ordre
  async function handleFinish() {
    setActionError("");
    setMessage("");
    setWorking(true);

    try {
      const updated = await finishOrder(id);
      applyUpdate(updated);
      setMessage("Ordre terminé.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <p><Link to="/operator">← Retour à mes ordres</Link></p>

      <DataState loading={loading} error={error} onRetry={reload}>
        {order && (
          <>
            <div className="page-header">
              <h1>
                {order.reference} <StatusBadge status={order.status} />
              </h1>

              {order.status === "PLANIFIE" && !confirmingStart && (
                <button
                  type="button"
                  disabled={working}
                  onClick={() => setConfirmingStart(true)}
                >
                  Démarrer l'ordre
                </button>
              )}

              {order.status === "EN_COURS" && (
                <button type="button" disabled={working} onClick={handleFinish}>
                  {working ? "Traitement..." : "Terminer l'ordre"}
                </button>
              )}
            </div>

            {message && <p className="success" role="status">{message}</p>}
            {actionError && <p className="error" role="alert">{actionError}</p>}

            {confirmingStart && (
              <div className="inline-confirm" role="alertdialog">
                <span>
                  Démarrer cet ordre ? Les matières nécessaires seront déduites du stock.
                </span>
                <button type="button" disabled={working} onClick={handleStart}>
                  {working ? "Démarrage..." : "Oui, démarrer"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={working}
                  onClick={() => setConfirmingStart(false)}
                >
                  Non
                </button>
              </div>
            )}

            <div className="panel info-grid">
              <div><strong>Créé le</strong><br />{formatDate(order.createdAt)}</div>
              <div><strong>Démarré le</strong><br />{formatDate(order.startedAt)}</div>
              <div><strong>Terminé le</strong><br />{formatDate(order.finishedAt)}</div>
            </div>

            <h2>Produits à fabriquer</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité demandée</th>
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

            <h2>Matières nécessaires (total)</h2>
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

export default OperatorOrderDetail;