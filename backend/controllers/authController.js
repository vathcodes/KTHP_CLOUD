// controllers/authController.js
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import { generateToken } from '../middleware/auth.js';

dotenv.config();

// Kết nối Neo4j
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// REGISTER
export const register = async (req, res) => {
    console.log(req.body);

    const { name, email, password, role } = req.body;
    const userRole = role || 'user'; // Nếu không có role, mặc định là 'user'
    const session = driver.session();

    try {
        // Kiểm tra user đã tồn tại chưa
        const existingUser = await session.run(
            `MATCH (u:User {email: $email}) RETURN u`,
            { email }
        );

        if (existingUser.records.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Tạo user mới
        const result = await session.run(
            `CREATE (u:User {name: $name, email: $email, password: $password, role: $role})
             RETURN u`,
            { name, email, password, role: userRole }
        );

        const user = result.records[0].get('u').properties;

        res.status(201).json({ message: 'User registered', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    } finally {
        await session.close();
    }
};
// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;
    const session = driver.session();

    try {
        // Tìm user theo email
        const result = await session.run(
            `MATCH (u:User {email: $email}) RETURN u`,
            { email }
        );

        if (result.records.length === 0) {
            return res.status(401).json({ error: 'Thong tin dang nhap khong hop le' });
        }

        const user = result.records[0].get('u').properties;

        // So sánh password
        if (user.password !== password) {
            return res.status(401).json({ error: 'Thong tin dang nhap khong hop le' });
        }

        // Tạo JWT token
        const token = generateToken({ id: user.email, role: user.role }); // dùng email làm id

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    } finally {
        await session.close();
    }
};
