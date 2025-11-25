import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosConfig";
import { toast } from "react-toastify";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
const Dashboard = () => {
  const [foodList, setFoodList] = useState([]);
  const [newFood, setNewFood] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    category: "",
  });
  const [editingFood, setEditingFood] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // Trạng thái hiện/ẩn form
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/foods")
      .then((response) => {
        setFoodList(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleCreateFood = () => {
    const formData = new FormData();
    formData.append("name", newFood.name);
    formData.append("price", newFood.price);
    formData.append("description", newFood.description);
    formData.append("category", newFood.category);
    if (newFood.imageFile) {
      formData.append("image", newFood.imageFile); // key 'image' trùng với multer trên backend
    }

    axiosInstance
      .post("/foods", formData)
      .then(() => {
        axiosInstance
          .get("/foods")
          .then((response) => {
            setFoodList(response.data);
          })
          .catch((error) => {
            console.error(error);
            toast.error("Có lỗi khi lấy danh sách món ăn");
          });
        toast.success("Món ăn đã được tạo thành công");
        setNewFood({
          name: "",
          price: "",
          description: "",
          category: "",
          imageFile: null,
        });
        setIsFormVisible(false); // Ẩn form sau khi tạo món ăn
      })
      .catch((error) => {
        console.error(error);
        toast.error("Có lỗi khi tạo món ăn");
      });
  };
  const handleUpdateFood = (foodId) => {
    if (!editingFood) return;

    const formData = new FormData();
    formData.append("name", editingFood.name);
    formData.append("price", editingFood.price);
    formData.append("description", editingFood.description);
    formData.append("category", editingFood.category);

    // Chỉ gửi file nếu có file mới
    if (editingFood.file) {
      formData.append("image", editingFood.file); // trùng key với Multer
      console.log("Uploading new file:", editingFood.file);
    } else {
      console.log("No new file, backend sẽ giữ nguyên ảnh cũ");
    }

    axiosInstance
      .put(`/foods/${foodId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Update response:", response.data);
        setFoodList((prevFoods) =>
          prevFoods.map((f) =>
            f.id === foodId ? { ...f, ...response.data.food } : f
          )
        );
        toast.success("Món ăn đã được cập nhật");
        setEditingFood(null);
      })
      .catch((err) => {
        console.error("Update error:", err);
        toast.error("Có lỗi khi cập nhật món ăn");
      });
  };

// Xóa món ăn
const handleDeleteFood = (foodId) => {
  console.log("Sending ID to delete:", foodId); // phải là UUID string

  axiosInstance
    .delete(`/foods/${foodId}`) // gửi đúng UUID
    .then((response) => {
      if (response.status === 200) {
        setFoodList((prevFoods) =>
          prevFoods.filter((food) => food.id !== foodId)
        );
        toast.success("Món ăn đã được xóa");
      }
    })
    .catch((error) => {
      console.error("Delete error:", error.response?.data || error.message);
      toast.error("Có lỗi khi xóa món ăn");
    });
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      <button className="logout" onClick={handleLogout}>
        Logout
      </button>

      <div className="cart-icon" onClick={() => navigate("/cart")}>
        <FaShoppingCart size={30} />
      </div>

      <button
        className="toggle-form-button"
        onClick={() => setIsFormVisible(!isFormVisible)}
      >
        Tạo món ăn mới
      </button>

      {isFormVisible && (
        <div className="food-form-overlay">
          <div className="food-form">
            <h3>Tạo món ăn mới</h3>
            <input
              type="text"
              placeholder="Tên món ăn"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Giá tiền"
              value={newFood.price}
              onChange={(e) =>
                setNewFood({ ...newFood, price: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Mô tả"
              value={newFood.description}
              onChange={(e) =>
                setNewFood({ ...newFood, description: e.target.value })
              }
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setNewFood({
                  ...newFood,
                  imageFile: file,
                  preview: file ? URL.createObjectURL(file) : null,
                });
              }}
            />
            {/* Hiển thị preview ảnh nếu có */}
            {newFood.preview && (
              <img src={newFood.preview} alt="preview" width="50" height="50" />
            )}
            <select
              value={newFood.category}
              onChange={(e) =>
                setNewFood({ ...newFood, category: e.target.value })
              }
            >
              <option value="">Chọn danh mục</option>
              <option value="Drink">Drink</option>
              <option value="Food">Food</option>
            </select>
            <div className="form-buttons">
              <button onClick={handleCreateFood}>Tạo món ăn</button>
              <button onClick={() => setIsFormVisible(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      <div className="food-list">
        <h2>Danh sách món ăn</h2>
        {foodList.length > 0 ? (
          <table className="food-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên món ăn</th>
                <th>Giá tiền</th>
                <th>Mô tả</th>
                <th>Danh mục</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {foodList.map((food, index) => (
                <tr key={food.name + index}>
                  {editingFood && editingFood.id === food.id ? (
                    <>
                      <td>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setEditingFood({
                              ...editingFood,
                              file: file,
                              preview: file
                                ? URL.createObjectURL(file)
                                : editingFood.imageUrl,
                            });
                          }}
                        />
                        {/* Hiển thị preview ảnh mới hoặc ảnh cũ */}
                        <img
                          src={editingFood.preview || editingFood.imageUrl}
                          alt="preview"
                          width="50"
                          height="50"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editingFood.name}
                          onChange={(e) =>
                            setEditingFood({
                              ...editingFood,
                              name: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editingFood.price}
                          onChange={(e) =>
                            setEditingFood({
                              ...editingFood,
                              price: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editingFood.description}
                          onChange={(e) =>
                            setEditingFood({
                              ...editingFood,
                              description: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={editingFood.category}
                          onChange={(e) =>
                            setEditingFood({
                              ...editingFood,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="Drink">Drink</option>
                          <option value="Food">Food</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => handleUpdateFood(food.id)}>
                          Cập nhật
                        </button>
                        <button onClick={() => setEditingFood(null)}>
                          Hủy
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          width="50"
                          height="50"
                        />
                      </td>
                      <td>{food.name}</td>
                      <td>{food.price} VND</td>
                      <td>{food.description}</td>
                      <td>{food.category}</td>
                      <td>
                        <button
                          className="btn-ede"
                          onClick={() => setEditingFood(food)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-ede"
                          onClick={() => handleDeleteFood(food.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không có món ăn nào.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
