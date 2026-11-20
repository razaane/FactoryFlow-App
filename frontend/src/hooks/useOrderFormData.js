import { useEffect, useState } from "react";
import { getMaterials } from "../services/materialService";
import { getProducts } from "../services/productService";
import { getOperators } from "../services/userService";
import { getErrorMessage } from "../utils/getErrorMessage";

const INITIAL = {
  products: [],
  operators: [],
  materials: [],
  loading: true,
  error: ""
};

export function useOrderFormData() {
  const [state, setState] = useState(INITIAL);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getProducts({ limit: 100 }),
      getOperators(),
      getMaterials({ limit: 100 })
    ])
      .then(([productsResult, operators, materialsResult]) => {
        if (cancelled) return;
        setState({
          products: productsResult.data,
          operators,
          materials: materialsResult.items,
          loading: false,
          error: ""
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ ...INITIAL, loading: false, error: getErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}