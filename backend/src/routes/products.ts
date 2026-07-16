import { Router, Request, Response } from 'express'
import { db } from '../index'
import { requireAuth } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

// GET MINE
router.get('/mine', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        'SELECT id, name, description, price, image_url, created_at FROM products WHERE user_id = $1 ORDER BY created_at DESC',
        [(req as any).userId]
    )
    res.json(result.rows)
})

// LIKE
router.post('/:id/like', requireAuth, async (req: Request, res: Response) => {
    await db.query(
        'INSERT INTO likes (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [(req as any).userId, req.params.id]
    )

    const product = await db.query('SELECT user_id FROM products WHERE id = $1', [req.params.id])
    if (product.rows.length > 0 && product.rows[0].user_id !== (req as any).userId) {
        await db.query(
            'INSERT INTO notifications (user_id, actor_id, type, product_id) VALUES ($1, $2, $3, $4)',
            [product.rows[0].user_id, (req as any).userId, 'like', req.params.id]
        )
    }

    res.status(201).json({ message: 'liked' })
})

// UNLIKE
router.delete('/:id/like', requireAuth, async (req: Request, res: Response) => {
    await db.query(
        'DELETE FROM likes WHERE user_id = $1 AND product_id = $2',
        [(req as any).userId, req.params.id]
    )
    res.json({ message: 'unliked' })
})

// GET FEED (products from followed users)
router.get('/feed', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        `SELECT p.id, p.name, p.description, p.price, p.image_url, p.created_at,
                u.id AS user_id, u.username, u.profile_picture,
                (SELECT COUNT(*) FROM likes WHERE product_id = p.id) AS likes_count,
                EXISTS(SELECT 1 FROM likes WHERE product_id = p.id AND user_id = $1) AS is_liked
         FROM products p
         JOIN users u ON u.id = p.user_id
         WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
         ORDER BY p.created_at DESC`,
        [(req as any).userId]
    )
    res.json(result.rows)
})

// GET BY USER (public)
router.get('/user/:id', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        `SELECT p.id, p.name, p.description, p.price, p.image_url, p.created_at,
                (SELECT COUNT(*) FROM likes WHERE product_id = p.id) AS likes_count,
                EXISTS(SELECT 1 FROM likes WHERE product_id = p.id AND user_id = $2) AS is_liked
         FROM products p
         WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
        [req.params.id, (req as any).userId]
    )
    res.json(result.rows)
})

// GET BY ID (single product detail)
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        `SELECT p.id, p.name, p.description, p.price, p.image_url, p.created_at,
                u.id AS user_id, u.username, u.profile_picture,
                (SELECT COUNT(*) FROM likes WHERE product_id = p.id) AS likes_count,
                EXISTS(SELECT 1 FROM likes WHERE product_id = p.id AND user_id = $2) AS is_liked
         FROM products p
         JOIN users u ON u.id = p.user_id
         WHERE p.id = $1`,
        [req.params.id, (req as any).userId]
    )

    if (result.rows.length === 0) {
        res.status(404).json({ message: 'product not found' })
        return
    }

    res.json(result.rows[0])
})

// CREATE
router.post('/', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
    const { name, description, price } = req.body

    if(!name || !price){
        res.status(400).json({message: 'name and price are required'})
        return
    }

    const image_url = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : null

    const result = await db.query(
        'INSERT INTO products (user_id, name, description, price, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [(req as any).userId, name, description, price, image_url]
    )
    res.status(201).json(result.rows[0])
})

// UPDATE
router.patch('/:id', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
    const { name, description, price } = req.body

    const existing = await db.query(
        'SELECT * FROM products WHERE id = $1 AND user_id = $2',
        [req.params.id, (req as any).userId]
    )
    if (existing.rows.length === 0) {
        res.status(404).json({ message: 'product not found' })
        return
    }

    const image_url = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : existing.rows[0].image_url

    const result = await db.query(
        'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
        [name, description, price, image_url, req.params.id, (req as any).userId]
    )
    res.json(result.rows[0])
})

// DELETE
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *',
        [req.params.id, (req as any).userId]
    )

    if (result.rows.length === 0) {
        res.status(404).json({ message: 'product not found' })
        return
    }

    res.json({ message: 'product deleted' })
})

export default router
