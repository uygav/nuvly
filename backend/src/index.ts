import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth'
import productsRouter from './routes/products'
import { requireAuth } from './middleware/auth';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 3001;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// cors
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser())


//auths
app.use('/auth', authRouter)
app.use('/products', productsRouter)

//middlewares
app.get('/protected', requireAuth, (req, res) => {
  res.json({ message: 'youre logged in !' });
});



app.get('/', async (req, res) => {
  try{
    await db.query('SELECT 1')
    res.json({message: "DB Connection ✅"})
  }catch(error){
    console.error("DB connection error :", error)
    res.status(500).json({message: "DB connection ❌"})
  }
});

app.listen(PORT, async () => {
  try {
    await db.query('SELECT 1');
    console.log(`Server is running on :  http://localhost:${PORT}`);
    console.log('Database connection successful.!');
  } catch (error) {
    console.error('The server could not connect to the database when it started.:', error);
  }
});
