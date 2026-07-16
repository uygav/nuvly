import { Router, Request, Response } from 'express'
import { db } from '../index'
import { requireAuth } from '../middleware/auth'

const router = Router()

// LIST
router.get('/', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        `SELECT n.id, n.type, n.is_read, n.created_at,
                n.product_id, p.name AS product_name,
                u.id AS actor_id, u.username, u.profile_picture
         FROM notifications n
         JOIN users u ON u.id = n.actor_id
         LEFT JOIN products p ON p.id = n.product_id
         WHERE n.user_id = $1
         ORDER BY n.created_at DESC
         LIMIT 50`,
        [(req as any).userId]
    )
    res.json(result.rows)
})

// UNREAD COUNT
router.get('/unread-count', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
        [(req as any).userId]
    )
    res.json({ count: Number(result.rows[0].count) })
})

// MARK ALL AS READ
router.patch('/read-all', requireAuth, async (req: Request, res: Response) => {
    await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
        [(req as any).userId]
    )
    res.json({ message: 'marked as read' })
})

export default router
