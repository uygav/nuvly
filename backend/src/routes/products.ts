import { Router, Request, Response } from 'express'
import { db } from '../index'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET MINE
router.get('/mine', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        'SELECT id, name, description, price, image_url, created_at FROM products WHERE user_id = $1 ORDER BY created_at DESC',
        [(req as any).userId]
    )
    res.json(result.rows)
})

// CREATE
router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { name, description, price, image_url } = req.body

    if(!name || !price){
        res.status(400).json({message: 'name and price are required'})
        return
    }

    const result = await db.query(
        'INSERT INTO products (user_id, name, description, price, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [(req as any).userId, name, description, price, image_url]
    )
    res.status(201).json(result.rows[0])
})

export default router
