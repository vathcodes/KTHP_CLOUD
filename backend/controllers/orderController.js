// controllers/orderController.js
import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";


dotenv.config();

// Kết nối Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  const session = driver.session();
  try {
    const { food } = req.body; // food = [{ foodId, quantity }, ...]
    if (!Array.isArray(food) || food.length === 0) {
      return res.status(400).json({ error: "Danh sách món ăn không hợp lệ" });
    }

    const userId = req.user.id; // email hoặc id Neo4j của user
    const orderId = uuidv4(); // Tạo id riêng cho Order

    // Tạo Order node và liên kết với User
    const result = await session.run(
      `CREATE (o:Order {id: $orderId, status: 'pending', createdAt: datetime()})
       WITH o
       MATCH (u:User {email: $userId})
       CREATE (u)-[:PLACED]->(o)
       RETURN o`,
      { userId, orderId }
    );

    const orderNode = result.records[0].get("o");

    // Tạo relationship giữa Order và Food với quantity
    for (const item of food) {
      await session.run(
        `MATCH (o:Order {id: $orderId}), (f:Food {id: $foodId})
         CREATE (o)-[:CONTAINS {quantity: $quantity}]->(f)`,
        {
          orderId: orderNode.properties.id, // match theo id riêng
          foodId: item.foodId,              // match theo id riêng của Food
          quantity: item.quantity,
        }
      );
    }

    res.status(201).json({
      message: "Order created",
      orderId: orderNode.properties.id, // trả về id riêng
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Lấy tất cả đơn hàng
export const getOrders = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (o:Order)<-[:PLACED]-(u:User)
       OPTIONAL MATCH (o)-[c:CONTAINS]->(f:Food)
       RETURN o, u, collect(
         CASE WHEN f IS NOT NULL THEN {foodId: f.id, name: f.name, price: f.price, quantity: c.quantity} ELSE NULL END
       ) as items`
    );

    const orders = result.records.map(record => {
      const items = record.get("items").filter(i => i !== null);
      return {
        id: record.get("o").properties.id, // trả về id riêng
        status: record.get("o").properties.status,
        createdAt: record.get("o").properties.createdAt,
        user: record.get("u").properties,
        food: items.map(i => ({
          foodId: i.foodId,
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
        }))
      };
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(400).json({ error: error.message });
  } finally {
    await session.close();
  }
};
// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
  const session = driver.session();
  try {
    const { status } = req.body;
    const orderId = req.params.id; // UUID string từ frontend

    const result = await session.run(
      `MATCH (o:Order {id: $orderId})
       SET o.status = $status
       RETURN o`,
      { orderId, status }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated",
      order: result.records[0].get("o").properties,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Xóa nhiều đơn hàng theo UUID
export const deleteOrders = async (req, res) => {
  const session = driver.session();
  try {
    const { ids } = req.body; // mảng UUID của các Order

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Danh sách ID không hợp lệ" });
    }

    for (const orderId of ids) {
      const result = await session.run(
        `MATCH (o:Order {id: $orderId})
         DETACH DELETE o
         RETURN o`,
        { orderId }
      );

      // Nếu không tìm thấy order, có thể log hoặc bỏ qua
      if (result.records.length === 0) {
        console.warn(`Order with id ${orderId} not found`);
      }
    }

    res.status(200).json({ message: "Xóa đơn hàng thành công" });
  } catch (error) {
    console.error("Delete orders error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};
