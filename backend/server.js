import express from 'express';
import cors from 'cors';
import neo4j from 'neo4j-driver';
import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));


// Kết nối Neo4j
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Kiểm tra kết nối và log
driver.verifyConnectivity()
    .then(() => console.log('✅ Connected to Neo4j successfully'))
    .catch(err => console.error('❌ Neo4j connection error:', err));

const session = driver.session();

// Middleware thêm session vào request để dùng trong các route
app.use((req, res, next) => {
    req.neo4jSession = session;
    next();
});

// Route root
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API đang hoạt động 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Đóng driver khi ứng dụng tắt
process.on('exit', async () => {
    await session.close();
    await driver.close();
});
