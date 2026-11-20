import { Link, useNavigate } from "react-router-dom";
import OrderEditor from "../../components/OrderEditor";
import { createOrder } from "../../services/orderService";

function OrderCreate() {
  const navigate = useNavigate();

  // si l'API refuse (erreur), OrderForm affiche le message
  async function handleCreate(payload) {
    const order = await createOrder(payload);

    navigate(`/admin/orders/${order._id}`, {
      state: { message: "Ordre créé et affecté à l'opérateur." }
    });
  }

  return (
    <div>
      <p><Link to="/admin/orders">← Retour aux ordres</Link></p>

      <OrderEditor
        title="Nouvel ordre de fabrication"
        submitLabel="Créer l'ordre"
        onSubmit={handleCreate}
        onCancel={() => navigate("/admin/orders")}
      />
    </div>
  );
}

export default OrderCreate;