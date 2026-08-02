import { Router, Request, Response } from 'express'
import { db } from '../index'
import { requireAuth } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

// GET MINE
router.get('/mine', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        'SELECT id, name, description, price, image_url, category, created_at FROM products WHERE user_id = $1 ORDER BY created_at DESC',
        [(req as any).userId]
    )
    res.json(result.rows)
})

// SEARCH
router.get('/search', requireAuth, async (req: Request, res: Response) => {
    const q = (req.query.q as string) || ''
    const category = (req.query.category as string) || ''

    const params: any[] = [`%${q}%`]
    let categoryClause = ''
    if (category) {
        params.push(category)
        categoryClause = `AND p.category = $${params.length}`
    }

    const result = await db.query(
        `SELECT p.id, p.name, p.price, p.image_url, p.category,
                u.id AS user_id, u.username
         FROM products p
         JOIN users u ON u.id = p.user_id
         WHERE p.name ILIKE $1 ${categoryClause}
         ORDER BY p.created_at DESC
         LIMIT 20`,
        params
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
                (SELECT COUNT(*) FROM comments WHERE product_id = p.id) AS comments_count,
                EXISTS(SELECT 1 FROM likes WHERE product_id = p.id AND user_id = $1) AS is_liked
         FROM products p
         JOIN users u ON u.id = p.user_id
         WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
         ORDER BY p.created_at DESC`,
        [(req as any).userId]
    )
    res.json(result.rows)
})

// GET ALL (every product from every user)
router.get('/all', requireAuth, async (req: Request, res: Response) => {
    const category = (req.query.category as string) || ''
    const params: any[] = [(req as any).userId]
    let categoryClause = ''
    if (category) {
        params.push(category)
        categoryClause = `WHERE p.category = $${params.length}`
    }

    const result = await db.query(
        `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category, p.created_at,
                u.id AS user_id, u.username, u.profile_picture,
                (SELECT COUNT(*) FROM likes WHERE product_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM comments WHERE product_id = p.id) AS comments_count,
                EXISTS(SELECT 1 FROM likes WHERE product_id = p.id AND user_id = $1) AS is_liked
         FROM products p
         JOIN users u ON u.id = p.user_id
         ${categoryClause}
         ORDER BY p.created_at DESC`,
        params
    )
    res.json(result.rows)
})

// GET BY USER (public)
router.get('/user/:id', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        `SELECT p.id, p.name, p.description, p.price, p.image_url, p.created_at,
                (SELECT COUNT(*) FROM likes WHERE product_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM comments WHERE product_id = p.id) AS comments_count,
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
        `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category, p.created_at,
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

// GET COMMENTS
router.get('/:id/comments', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        `SELECT c.id, c.content, c.created_at,
                u.id AS user_id, u.username, u.profile_picture,
                (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS likes_count,
                EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = $2) AS is_liked
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.product_id = $1
         ORDER BY c.created_at ASC`,
        [req.params.id, (req as any).userId]
    )
    res.json(result.rows)
})

// LIKE COMMENT
router.post('/:id/comments/:commentId/like', requireAuth, async (req: Request, res: Response) => {
    await db.query(
        'INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [(req as any).userId, req.params.commentId]
    )

    const comment = await db.query('SELECT user_id FROM comments WHERE id = $1', [req.params.commentId])
    if (comment.rows.length > 0 && comment.rows[0].user_id !== (req as any).userId) {
        await db.query(
            'INSERT INTO notifications (user_id, actor_id, type, product_id) VALUES ($1, $2, $3, $4)',
            [comment.rows[0].user_id, (req as any).userId, 'comment_like', req.params.id]
        )
    }

    res.status(201).json({ message: 'liked' })
})

// UNLIKE COMMENT
router.delete('/:id/comments/:commentId/like', requireAuth, async (req: Request, res: Response) => {
    await db.query(
        'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
        [(req as any).userId, req.params.commentId]
    )
    res.json({ message: 'unliked' })
})

// ADD COMMENT
router.post('/:id/comments', requireAuth, async (req: Request, res: Response) => {
    const { content } = req.body

    if (!content || !content.trim()) {
        res.status(400).json({ message: 'content is required' })
        return
    }

    const result = await db.query(
        `INSERT INTO comments (product_id, user_id, content) VALUES ($1, $2, $3)
         RETURNING id, content, created_at, user_id`,
        [req.params.id, (req as any).userId, content]
    )

    const product = await db.query('SELECT user_id FROM products WHERE id = $1', [req.params.id])
    if (product.rows.length > 0 && product.rows[0].user_id !== (req as any).userId) {
        await db.query(
            'INSERT INTO notifications (user_id, actor_id, type, product_id) VALUES ($1, $2, $3, $4)',
            [product.rows[0].user_id, (req as any).userId, 'comment', req.params.id]
        )
    }

    res.status(201).json(result.rows[0])
})

// DELETE COMMENT
router.delete('/:id/comments/:commentId', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        'DELETE FROM comments WHERE id = $1 AND product_id = $2 AND user_id = $3 RETURNING *',
        [req.params.commentId, req.params.id, (req as any).userId]
    )

    if (result.rows.length === 0) {
        res.status(404).json({ message: 'comment not found' })
        return
    }

    res.json({ message: 'comment deleted' })
})

// CREATE
router.post('/', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
    const { name, description, price, category } = req.body

    if(!name || !price){
        res.status(400).json({message: 'name and price are required'})
        return
    }

    if (!req.file) {
        res.status(400).json({ message: 'image is required' })
        return
    }

    const image_url = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : null

    const result = await db.query(
        'INSERT INTO products (user_id, name, description, price, image_url, category) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [(req as any).userId, name, description, price, image_url, category || 'Other']
    )
    res.status(201).json(result.rows[0])
})

// UPDATE
router.patch('/:id', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
    const { name, description, price, category } = req.body

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
        'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, category = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
        [name, description, price, image_url, category || 'Other', req.params.id, (req as any).userId]
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
