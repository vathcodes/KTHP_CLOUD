import React, { useEffect, useState } from "react";
import axios from "./axiosConfig";
import { toast } from "react-toastify";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("/orders");
        console.log("=== Frontend fetched orders ===");
      console.log(response.data); // log dữ liệu nhận được từ backend
      setOrders(response.data);
        setOrders(response.data);
      } catch (error) {
        console.error(
          "Lỗi khi lấy dữ liệu giỏ hàng:",
          error.response?.data || error.message
        );
        toast.error("Không thể tải giỏ hàng");
      }
    };

    fetchCart();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`/orders/${orderId}`, {
        status: newStatus,
      });
      toast.success(`Trạng thái cập nhật thành ${newStatus}`);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: response.data.order.status }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật trạng thái:",
        error.response?.data || error.message
      );
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDeleteOrders = async () => {
    try {
      await axios.delete("/orders", { data: { ids: selectedOrders } }); // Xóa nhiều đơn hàng
      toast.success("Xóa đơn hàng thành công");
      setOrders((prevOrders) =>
        prevOrders.filter((order) => !selectedOrders.includes(order.id))
      );
      setSelectedOrders([]);
    } catch (error) {
      console.error(
        "Lỗi khi xóa đơn hàng:",
        error.response?.data || error.message
      );
      toast.error("Không thể xóa đơn hàng");
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(
      (prevSelected) =>
        prevSelected.includes(orderId)
          ? prevSelected.filter((id) => id !== orderId) // Bỏ chọn nếu đã được tick
          : [...prevSelected, orderId] // Thêm vào nếu chưa được tick
    );
  };

  const calculateTotal = (foodItems) => {
  const total = foodItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  console.log("Tổng tiền tính được:", total); // log tổng tiền
  return total;
};


  return (
    <CartContainer>
      <BackButton onClick={() => navigate("/admin")}>
        <FaArrowLeft size={30} />
        Trở về
      </BackButton>

      <h1>Giỏ hàng của bạn</h1>
      {orders.length > 0 && (
        <DeleteButton
          onClick={handleDeleteOrders}
          disabled={selectedOrders.length === 0}
        >
          Xóa đơn hàng đã chọn
        </DeleteButton>
      )}

      {orders.length > 0 ? (
        <OrderList>
          {orders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <Checkbox
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => toggleOrderSelection(order.id)}
                />
                <h2>
                  Người đặt:{" "}
                  {order.user && order.user.name
                    ? order.user.name
                    : "Không xác định"}
                </h2>
              </OrderHeader>

              <OrderInfo>
                <OrderStatus>
                  Status:
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Success">Success</option>
                  </select>
                </OrderStatus>
                <FoodList>
                  {order.food && order.food.length > 0 ? (
                    order.food.map((item, index) => (

                      <FoodItem key={item.foodId + index}>
                        <p>
                          - Món: {item.name} - SL: {item.quantity} - Giá:{" "}
                          {item.price} VND
                        </p>
                      </FoodItem>
                    ))
                  ) : (
                    <p>Không có món nào</p>
                  )}
                </FoodList>
                <TotalAmount>
                  TỔNG TIỀN ĐƠN HÀNG:{" "}
                  {order.food ? calculateTotal(order.food) : 0} VND
                </TotalAmount>
              </OrderInfo>
            </OrderCard>
          ))}
        </OrderList>
      ) : (
        <EmptyCart>Giỏ hàng trống</EmptyCart>
      )}
    </CartContainer>
  );
};

export default Cart;

// Styled components
const CartContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  h1 {
    text-align: center;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #007bff;
  font-size: 18px;
  cursor: pointer;
  margin-bottom: 20px;

  svg {
    margin-right: 8px;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OrderCard = styled.div`
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 5px;
  background: #f9f9f9;
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Checkbox = styled.input`
  transform: scale(1.2);
  cursor: pointer;
`;

const OrderInfo = styled.div``;

const OrderStatus = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;

  select {
    margin-left: 10px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
`;

const FoodList = styled.div`
  margin-top: 10px;
`;

const FoodItem = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 5px;
  font-size: 16px;
`;

const TotalAmount = styled.div`
  margin-top: 10px;
  font-weight: bold;
  color: #333;
`;

const EmptyCart = styled.div`
  text-align: center;
  font-size: 18px;
  color: #999;
`;

const DeleteButton = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  display: block;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover:enabled {
    background-color: #c0392b;
  }
`;
