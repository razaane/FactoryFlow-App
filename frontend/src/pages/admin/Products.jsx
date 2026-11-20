import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataState from "../../components/DataState";
import Pagination from "../../components/Pagination";
import ProductForm from "../../components/ProductForm";
import { getMaterials } from "../../services/materialService";
import {
  createProduct,
  getProducts,
  updateProduct
} from "../../services/productService";
import { getErrorMessage } from "../../utils/getErrorMessage";

function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState(null); // null | "new" | un produit
  const [message, setMessage] = useState("");

  // matières disponibles pour composer un produit
  const [materials, setMaterials] = useState([]);
  const [materialsError, setMaterialsError] = useState("");

  useEffect(() => {
    getMaterials({ limit: 100 })
      .then((result) => setMaterials(result.items))
      .catch((err) => setMaterialsError(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    let cancelled = false;

    getProducts({ page, search })
      .then((result) => {
        if (cancelled) return;
        setProducts(result.data);
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

  // rafraîchir la liste après une mutation
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
    await createProduct(payload);
    setEditing(null);
    setMessage("Produit créé.");
    setPage(1);
    reload();
  }

  async function handleUpdate(payload) {
    await updateProduct(editing._id, payload);
    setEditing(null);
    setMessage("Produit modifié.");
    reload();
  }

  function openForm(value) {
    setMessage("");
    setEditing(value);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Produits</h1>
        <button
          type="button"
          disabled={materials.length === 0}
          onClick={() => openForm("new")}
        >
          Nouveau produit
        </button>
      </div>

      {materialsError && <p className="error" role="alert">{materialsError}</p>}

      {!materialsError && materials.length === 0 && (
        <p className="empty">
          Créez d'abord des <Link to="/admin/materials">matières premières</Link> pour composer un produit.
        </p>
      )}

      {message && <p className="success" role="status">{message}</p>}

      {editing === "new" && (
        <ProductForm
          materials={materials}
          onSubmit={handleCreate}
          onCancel={() => setEditing(null)}
        />
      )}

      {editing && editing !== "new" && (
        <ProductForm
          key={editing._id}
          initialValues={editing}
          materials={materials}
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

      <DataState
        loading={loading}
        error={error}
        isEmpty={products.length === 0}
        emptyMessage={
          search
            ? "Aucun produit ne correspond à votre recherche."
            : "Aucun produit pour le moment."
        }
        onRetry={reload}
      >
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
                <th>Composition (par unité)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.reference}</td>
                  <td>{product.name}</td>
                  <td>
                    <ul className="composition-list">
                      {product.composition.map((line, index) => (
                        <li key={index}>
                          {line.material?.name ?? "Matière supprimée"} : {line.quantity}{" "}
                          {line.material?.unit ?? ""}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => openForm(product)}
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

export default Products;