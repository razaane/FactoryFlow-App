import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DataState from "../../components/DataState";
import Pagination from "../../components/Pagination";
import StockEntryForm from "../../components/StockEntryForm";
import {
  addStockEntry,
  getMaterial,
  getMovements
} from "../../services/materialService";
import { getErrorMessage } from "../../utils/getErrorMessage";

function MaterialDetail() {
  const { id } = useParams(); // paramètre de route dynamique

  const [material, setMaterial] = useState(null);
  const [materialError, setMaterialError] = useState("");
  const [loadingMaterial, setLoadingMaterial] = useState(true);

  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [movementsError, setMovementsError] = useState("");
  const [loadingMovements, setLoadingMovements] = useState(true);

  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    getMaterial(id)
      .then((data) => {
        if (!cancelled) setMaterial(data);
      })
      .catch((err) => {
        if (!cancelled) setMaterialError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingMaterial(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  useEffect(() => {
    let cancelled = false;

    getMovements({ material: id, type, page })
      .then((result) => {
        if (cancelled) return;
        setMovements(result.data);
        setPagination(result.pagination);
      })
      .catch((err) => {
        if (!cancelled) setMovementsError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingMovements(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, page, type, reloadKey]);

  function reload() {
    setLoadingMaterial(true);
    setLoadingMovements(true);
    setMaterialError("");
    setMovementsError("");
    setReloadKey((key) => key + 1);
  }

  function goToPage(newPage) {
    setLoadingMovements(true);
    setPage(newPage);
  }

  function handleTypeChange(event) {
    setLoadingMovements(true);
    setPage(1);
    setType(event.target.value);
  }

  // rafraîchir le stock et l'historique après l'entrée
  async function handleStockEntry(quantity) {
    await addStockEntry(id, quantity);
    setMessage("Entrée de stock enregistrée.");
    setPage(1);
    reload();
  }

  return (
    <div>
      <p><Link to="/admin/materials">← Retour aux matières</Link></p>

      <DataState loading={loadingMaterial} error={materialError} onRetry={reload}>
        {material && (
          <>
            <h1>{material.name}</h1>

            <div className="panel info-grid">
              <div><strong>Référence</strong><br />{material.reference}</div>
              <div><strong>Unité</strong><br />{material.unit}</div>
              <div><strong>Stock actuel</strong><br />{material.quantity ?? "-"} {material.unit}</div>
              <div><strong>Seuil d'alerte</strong><br />{material.alertThreshold} {material.unit}</div>
            </div>

            {typeof material.quantity === "number" &&
              material.quantity <= material.alertThreshold && (
                <p className="error">Cette matière est sous son seuil d'alerte.</p>
              )}

            {message && <p className="success" role="status">{message}</p>}

            <StockEntryForm unit={material.unit} onSubmit={handleStockEntry} />

            <h2>Historique des mouvements</h2>

            <div className="toolbar">
              <label htmlFor="type">Type</label>
              <select id="type" value={type} onChange={handleTypeChange}>
                <option value="">Tous</option>
                <option value="ENTREE">Entrées</option>
                <option value="SORTIE">Sorties</option>
              </select>
            </div>

            <DataState
              loading={loadingMovements}
              error={movementsError}
              isEmpty={movements.length === 0}
              emptyMessage="Aucun mouvement pour le moment."
              onRetry={reload}
            >
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement) => (
                      <tr key={movement._id}>
                        <td>{new Date(movement.createdAt).toLocaleString("fr-FR")}</td>
                        <td>
                          <span className={movement.type === "ENTREE" ? "badge badge-ok" : "badge badge-danger"}>
                            {movement.type === "ENTREE" ? "Entrée" : "Sortie"}
                          </span>
                        </td>
                        <td>{movement.quantite} {material.unit}</td>
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
          </>
        )}
      </DataState>
    </div>
  );
}

export default MaterialDetail;