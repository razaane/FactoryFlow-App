import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataState from "../../components/DataState";
import MaterialForm from "../../components/MaterialForm";
import Pagination from "../../components/Pagination";
import {
  createMaterial,
  getMaterials,
  updateMaterial
} from "../../services/materialService";
import { getErrorMessage } from "../../utils/getErrorMessage";

function isLow(material) {
  return (
    typeof material.quantity === "number" &&
    material.quantity <= material.alertThreshold
  );
}

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState(null); // null | "new" | une matière
  const [message, setMessage] = useState("");

  // charge la liste quand la page, la recherche ou reloadKey change
  useEffect(() => {
    let cancelled = false;

    getMaterials({ page, search })
      .then((result) => {
        if (cancelled) return;
        setMaterials(result.items);
        setPagination(result.pagination);
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
  }, [page, search, reloadKey]);

  // calcul dérivé: matières sous leur seuil sur la page affichée
  const lowStockCount = useMemo(
    () => materials.filter(isLow).length,
    [materials]
  );

  // FP-97: rafraîchir la liste après une mutation
  function reload() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  function goToPage(newPage) {
    setPage(newPage);
    reload();
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    reload();
  }

  function handleClear() {
    setSearchInput("");
    setSearch("");
    setPage(1);
    reload();
  }

  async function handleCreate(payload) {
    await createMaterial(payload);
    setEditing(null);
    setMessage("Matière première créée.");
    setPage(1);
    reload();
  }

  async function handleUpdate(payload) {
    await updateMaterial(editing.id, payload);
    setEditing(null);
    setMessage("Matière première modifiée.");
    reload();
  }

  function openForm(value) {
    setMessage("");
    setEditing(value);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Matières premières</h1>
        <button type="button" onClick={() => openForm("new")}>
          Nouvelle matière
        </button>
      </div>

      {message && <p className="success" role="status">{message}</p>}

      {editing === "new" && (
        <MaterialForm onSubmit={handleCreate} onCancel={() => setEditing(null)} />
      )}

      {editing && editing !== "new" && (
        <MaterialForm
          key={editing.id}
          initialValues={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      <form className="toolbar" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Rechercher par nom ou référence"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <button type="submit">Rechercher</button>
        {search && (
          <button type="button" className="btn-secondary" onClick={handleClear}>
            Effacer
          </button>
        )}
      </form>

      {lowStockCount > 0 && (
        <p className="error">
          {lowStockCount} matière(s) sous leur seuil d'alerte sur cette page.
        </p>
      )}

      <DataState
        loading={loading}
        error={error}
        isEmpty={materials.length === 0}
        emptyMessage={
          search
            ? "Aucune matière ne correspond à votre recherche."
            : "Aucune matière première pour le moment."
        }
        onRetry={reload}
      >
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
                <th>Unité</th>
                <th>Stock</th>
                <th>Seuil</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id}>
                  <td>{material.reference}</td>
                  <td>{material.name}</td>
                  <td>{material.unit}</td>
                  <td>{material.quantity ?? "-"}</td>
                  <td>{material.alertThreshold}</td>
                  <td>
                    {isLow(material) ? (
                      <span className="badge badge-danger">Sous le seuil</span>
                    ) : (
                      <span className="badge badge-ok">OK</span>
                    )}
                  </td>
                  <td className="actions">
                    <Link to={`/admin/materials/${material.id}`}>Détail</Link>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => openForm(material)}
                    >
                      Modifier
                    </button>
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

export default Materials;