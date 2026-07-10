import { Router, Request, Response } from 'express'
import { db } from '../index'
import { requireAuth } from '../middleware/auth'

const router = Router()

// SEARCH
router.get('/search', requireAuth, async (req: Request, res: Response) => {
  const q = (req.query.q as string) || ''

  const result = await db.query(
    'SELECT id, username, profile_picture FROM users WHERE username ILIKE $1 LIMIT 20',
    [`%${q}%`]
  )
  res.json(result.rows)
})

// PUBLIC PROFILE
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const result = await db.query(
    'SELECT id, email, username, bio, profile_picture FROM users WHERE id = $1',
    [req.params.id]
  )

  if (result.rows.length === 0) {
    res.status(404).json({ message: 'user not found' })
    return
  }

  res.json(result.rows[0])
})

export default router
