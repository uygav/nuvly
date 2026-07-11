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
    `SELECT
       u.id, u.email, u.username, u.bio, u.profile_picture,
       (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
       (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
       EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) AS is_following
     FROM users u
     WHERE u.id = $1`,
    [req.params.id, (req as any).userId]
  )

  if (result.rows.length === 0) {
    res.status(404).json({ message: 'user not found' })
    return
  }

  res.json(result.rows[0])
})

// FOLLOW
router.post('/:id/follow', requireAuth, async (req: Request, res: Response) => {
  const followingId = req.params.id
  const followerId = (req as any).userId

  if (String(followerId) === followingId) {
    res.status(400).json({ message: 'you cannot follow yourself' })
    return
  }

  await db.query(
    'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [followerId, followingId]
  )
  res.status(201).json({ message: 'followed' })
})

// UNFOLLOW
router.delete('/:id/follow', requireAuth, async (req: Request, res: Response) => {
  await db.query(
    'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
    [(req as any).userId, req.params.id]
  )
  res.json({ message: 'unfollowed' })
})

// FOLLOWERS LIST
router.get('/:id/followers', requireAuth, async (req: Request, res: Response) => {
  const result = await db.query(
    `SELECT u.id, u.username, u.profile_picture
     FROM follows f
     JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = $1
     ORDER BY f.created_at DESC`,
    [req.params.id]
  )
  res.json(result.rows)
})

// FOLLOWING LIST
router.get('/:id/following', requireAuth, async (req: Request, res: Response) => {
  const result = await db.query(
    `SELECT u.id, u.username, u.profile_picture
     FROM follows f
     JOIN users u ON u.id = f.following_id
     WHERE f.follower_id = $1
     ORDER BY f.created_at DESC`,
    [req.params.id]
  )
  res.json(result.rows)
})

export default router
