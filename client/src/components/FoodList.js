import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axiosConfig";
import { toast } from "react-toastify";
import styled from "styled-components";

const FoodList = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]); // State cho danh mục
  const [selectedCategory, setSelectedCategory] = useState("");
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const foodResponse = await axios.get("/foods");
        setFoods(foodResponse.data);

        // Trích xuất danh mục từ dữ liệu món ăn
        const uniqueCategories = Array.from(
          new Set(foodResponse.data.map((food) => food.category))
        );
        setCategories(uniqueCategories); // Lưu danh mục vào state
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu", error);
      }
    };

    const currentUser = JSON.parse(localStorage.getItem("user"));
    setUser(currentUser);

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Bạn đã đăng xuất thành công!");
    navigate("/login");
  };
  const handleAddToCart = (food) => {
    // Kiểm tra nếu món ăn đã có trong giỏ, nếu có thì chỉ tăng quantity
    const existingFoodIndex = cart.findIndex((item) => item.id === food.id);
    if (existingFoodIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingFoodIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      const updatedFood = { ...food, quantity: 1 }; // Khởi tạo quantity là 1
      setCart((prevCart) => [...prevCart, updatedFood]);
    }
    toast.success(`${food.name} đã được thêm vào giỏ hàng!`);
  };

  const handlePlaceOrder = () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để đặt hàng!");
      return;
    }

    const payload = {
      userId: user.id,
      food: cart.map((item) => ({
        foodId: item.id,
        quantity: item.quantity, // Thêm trường quantity vào payload
      })),
    };

    axios
      .post("/orders", payload)
      .then(() => {
        toast.success("Đặt hàng thành công!");
        setCart([]); // Xóa giỏ hàng sau khi đặt hàng thành công
      })
      .catch((error) => {
        toast.error(`Lỗi: ${error.response?.data?.message || "Có lỗi xảy ra"}`);
      });
  };

  const handleIncrease = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = Number(updatedCart[index].quantity) + 1; // Đảm bảo là số
    setCart(updatedCart);
  };

  const handleDecrease = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity = Number(updatedCart[index].quantity) - 1; // Đảm bảo là số
      setCart(updatedCart);
    }
  };

  const handleRemoveFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  // Lọc món ăn theo danh mục đã chọn
  const filteredFoods = selectedCategory
    ? foods.filter((food) => food.category === selectedCategory)
    : foods;

  return (
    <Container>
      {/* Sidebar với danh mục */}
      <Sidebar>
        <h3>Danh mục</h3>
        <CategoryItem
          active={!selectedCategory}
          onClick={() => setSelectedCategory("")}
        >
          Tất cả
        </CategoryItem>
        {categories.map((category) => (
          <CategoryItem
            key={category}
            active={category === selectedCategory}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </CategoryItem>
        ))}
      </Sidebar>

      <Content>
        <Header>
          <h1 style={{ textAlign: "center" }}>Me Sờ Nu</h1>
          {user && <LogoutButton onClick={handleLogout}>Logout</LogoutButton>}
        </Header>
        <FoodListWrapper>
          {filteredFoods.map((food) => (
            <FoodCard key={food.id}>
              <FoodImage src={food.imageUrl} alt={food.name} />
              <FoodInfo>
                <h2>{food.name}</h2>
                <p>{food.description}</p>
                <Price>{food.price} VND</Price>
                <OrderButton onClick={() => handleAddToCart(food)}>
                  Đặt món
                </OrderButton>
              </FoodInfo>
            </FoodCard>
          ))}
        </FoodListWrapper>
      </Content>

      <OrderSummary>
        <h3>Chi tiết đặt hàng</h3>
        <OrderDetails>
          {cart.length === 0 ? (
            <p>Giỏ hàng đang trống</p>
          ) : (
            <div>
              {cart.map((item, index) => (
                <div key={index}>
                  <FoodItem>
                    <FoodImage1 src={item.imageUrl} alt={item.name} />
                    <FoodInfo>
                      <h4>{item.name}</h4>
                      <p>{item.price} VND</p>
                    </FoodInfo>
                    <ButtonWrapper>
                      <QuantityButton onClick={() => handleDecrease(index)}>
                        -
                      </QuantityButton>
                      <Quantity>{item.quantity}</Quantity>
                      <QuantityButton onClick={() => handleIncrease(index)}>
                        +
                      </QuantityButton>
                      <RemoveButton onClick={() => handleRemoveFromCart(index)}>
                        Xóa
                      </RemoveButton>
                    </ButtonWrapper>
                  </FoodItem>
                </div>
              ))}
            </div>
          )}
          <p>
            Tổng cộng:{""}
            {cart.reduce((total, item) => {
              const price = Number(item.price) || 0; // Chuyển giá trị thành số nếu có thể, nếu không sẽ là 0
              const quantity = Number(item.quantity) || 1; // Chuyển quantity thành số nếu có thể
              return total + price * quantity; // Tính tổng
            }, 0)}{" "}
            VND
          </p>
          <PlaceOrderButton
            disabled={cart.length === 0}
            onClick={handlePlaceOrder}
          >
            Đặt hàng
          </PlaceOrderButton>
        </OrderDetails>
      </OrderSummary>
    </Container>
  );
};

export default FoodList;

// Các styled-components như cũ

// Styled Components
const Container = styled.div`
  display: grid;
  grid-template-columns: 10% 65% 25%; /* Thay đổi tỷ lệ */
  gap: 20px;
  padding: 20px;
`;

const Sidebar = styled.div`
  padding: 10px;
  border-radius: 8px;
  width: %;
`;

const CategoryItem = styled.div`
  margin: 10px 0;
  padding: 10px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? "#3498db" : "#fff")};
  color: ${(props) => (props.active ? "#fff" : "#000")};
  border-radius: 5px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #2980b9;
    color: #fff;
  }
`;

const Content = styled.div`
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    margin: 0;
  }
`;

const FoodListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  justify-items: center;
`;

const FoodCard = styled.div`
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 300px;
  text-align: left;
  padding: 20px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FoodImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
`;
const FoodImage1 = styled.img`
  width: 50px; // Kích thước hình ảnh nhỏ lại
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
`;

const Price = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
`;

const OrderButton = styled.button`
  background-color: #3498db;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const LogoutButton = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c0392b;
  }
`;

const OrderSummary = styled.div`
  padding: 20px;
  border-radius: 8px;
`;

const OrderDetails = styled.div`
  margin-top: 20px;
`;

const PlaceOrderButton = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c0392b;
  }
`;
const FoodItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const FoodInfo = styled.div`
  flex: 1;
  margin-left: 10px;
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }
  p {
    margin: 5px 0;
    font-size: 14px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const QuantityButton = styled.button`
  background-color: #3498db;
  color: white;
  padding: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 5px;

  &:hover {
    background-color: #2980b9;
  }
`;

const Quantity = styled.span`
  font-size: 16px;
  margin: 0 10px;
`;

const RemoveButton = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    background-color: #c0392b;
  }
`;
