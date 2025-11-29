// controllers/foodController.js
import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";


dotenv.config();

// Kết nối Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Tạo món ăn mới
export const createFood = async (req, res) => {
  const session = driver.session();
  try {
    const { name, price, description, category } = req.body;
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

    // Tạo id riêng
    const id = uuidv4();

    const result = await session.run(
      `CREATE (f:Food {id: $id, name: $name, price: $price, description: $description, imageUrl: $imageUrl, category: $category})
       RETURN f`,
      { id, name, price: parseFloat(price), description, imageUrl, category }
    );

    const record = result.records[0].get("f");
    const food = {
      id: record.properties.id, // lấy id tự tạo
      ...record.properties
    };

    res.status(201).json({ message: 'Food created successfully', food });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  } finally {
    await session.close();
  }
};
export const getFoods = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (f:Food)
      RETURN id(f) AS id, f
    `);

    const foods = result.records.map((record) => {
      return {
        id: record.get("id").toNumber(), 
        ...record.get("f").properties
      };
    });

    res.status(200).json(foods);
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    await session.close();
  }
};
// Cập nhật món ăn theo UUID
export const updateFood = async (req, res) => {
  const session = driver.session();
  try {
    const foodId = req.params.id; // UUID string từ frontend
    console.log("=== UPDATE FOOD BY UUID ===", foodId);

    // Lấy món ăn hiện tại theo UUID
    const currentResult = await session.run(
      `MATCH (f:Food {id: $foodId}) RETURN f`,
      { foodId }
    );

    if (currentResult.records.length === 0) {
      return res.status(404).json({ message: "Food not found" });
    }

    const currentFood = currentResult.records[0].get("f").properties;

    // Dữ liệu từ req.body
    const { name, price, description, category } = req.body;

    // Giá trị cuối cùng: nếu frontend không gửi gì thì giữ nguyên
    const finalName = name || currentFood.name;
    const finalPrice = price !== undefined ? parseFloat(price) : currentFood.price;
    const finalDescription = description || currentFood.description;
    const finalCategory = category || currentFood.category;

    // Xử lý ảnh
    const finalImageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : currentFood.imageUrl;

    console.log("Updating food with:", {
      finalName,
      finalPrice,
      finalDescription,
      finalCategory,
      finalImageUrl,
    });

    // Cập nhật món ăn trong Neo4j theo UUID
    const result = await session.run(
      `MATCH (f:Food {id: $foodId})
       SET f.name = $name,
           f.price = $price,
           f.description = $description,
           f.category = $category,
           f.imageUrl = $imageUrl
       RETURN f`,
      {
        foodId,
        name: finalName,
        price: finalPrice,
        description: finalDescription,
        category: finalCategory,
        imageUrl: finalImageUrl,
      }
    );

    const updatedFood = result.records[0].get("f").properties;

    res.status(200).json({ message: "Food updated successfully", food: updatedFood });
  } catch (error) {
    console.error("Update food error:", error);
    res.status(400).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Xóa món ăn theo UUID
export const deleteFood = async (req, res) => {
  const session = driver.session();
  try {
    const foodId = req.params.id; // UUID string từ frontend

    const result = await session.run(
      `MATCH (f:Food {id: $foodId})
       DETACH DELETE f
       RETURN f`,
      { foodId }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.status(200).json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Delete food error:", error);
    res.status(400).json({ error: error.message });
  } finally {
    await session.close();
  }
};
