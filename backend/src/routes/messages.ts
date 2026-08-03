import { Router, Request, Response } from 'express'
import { db } from '../index'
import { requireAuth } from '../middleware/auth'

const router = Router()

// UNREAD COUNT
router.get('/unread-count', requireAuth, async (req: Request, res: Response) => {
    const result = await db.query(
        'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = FALSE',
        [(req as any).userId]
    )
    res.json({ count: Number(result.rows[0].count) })
})

// LIST CONVERSATIONS
router.get('/', requireAuth, async (req: Request, res: Response) => {
    const myId = (req as any).userId

    const result = await db.query(
        `WITH conversation_partners AS (
            SELECT
                CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_user_id,
                content,
                created_at,
                ROW_NUMBER() OVER (
                    PARTITION BY CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
                    ORDER BY created_at DESC
                ) AS rn
            FROM messages
            WHERE sender_id = $1 OR receiver_id = $1
         )
         SELECT cp.other_user_id, u.username, u.profile_picture,
                cp.content AS last_message, cp.created_at,
                (SELECT COUNT(*) FROM messages
                 WHERE sender_id = cp.other_user_id AND receiver_id = $1 AND is_read = FALSE) AS unread_count
         FROM conversation_partners cp
         JOIN users u ON u.id = cp.other_user_id
         WHERE cp.rn = 1
         ORDER BY cp.created_at DESC`,
        [myId]
    )
    res.json(result.rows)
})

// GET THREAD WITH A USER
router.get('/:userId', requireAuth, async (req: Request, res: Response) => {
    const myId = (req as any).userId
    const otherId = req.params.userId

    const result = await db.query(
        `SELECT id, sender_id, receiver_id, content, created_at
         FROM messages
         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at ASC`,
        [myId, otherId]
    )

    await db.query(
        'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE',
        [otherId, myId]
    )

    res.json(result.rows)
})

// SEND MESSAGE
router.post('/:userId', requireAuth, async (req: Request, res: Response) => {
    const { content } = req.body
    const myId = (req as any).userId

    if (!content || !content.trim()) {
        res.status(400).json({ message: 'content is required' })
        return
    }

    if (String(myId) === req.params.userId) {
        res.status(400).json({ message: 'cannot message yourself' })
        return
    }

    const result = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
        [myId, req.params.userId, content]
    )
    res.status(201).json(result.rows[0])
})

export default router
