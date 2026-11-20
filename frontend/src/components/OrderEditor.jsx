import DataState from "./DataState";
import OrderForm from "./OrderForm";
import { useOrderFormData } from "../hooks/useOrderFormData";

function OrderEditor(props) {
  const { products, operators, materials, loading, error } = useOrderFormData();

  const missingData =
    !loading && !error && (products.length === 0 || operators.length === 0);

  return (
    <DataState
      loading={loading}
      error={error}
      isEmpty={missingData}
      emptyMessage="Il faut au moins un produit et un opérateur (créé via POST /api/users) pour gérer un ordre."
    >
      <OrderForm
        {...props}
        products={products}
        operators={operators}
        materials={materials}
      />
    </DataState>
  );
}

export default OrderEditor;