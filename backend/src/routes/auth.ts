import {Router , Request, Response} from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { upload } from '../middleware/upload'
import { db } from '../index'
import { requireAuth } from '../middleware/auth'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET!


// REGISTER 
router.post('/register', async(req:Request, res:Response)=> {

    const {email, username, password} = req.body

    if (!username) {
        res.status(400).json({message: 'username is required'})
        return
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if(existing.rows.length>0){
        res.status(400).json({message: 'this email is already created'})
        return
    }

    const existingUsername = await db.query('SELECT id FROM users WHERE username = $1', [username])
    if(existingUsername.rows.length>0){
        res.status(400).json({message: 'this username is already taken'})
        return
    }

    const hashedPassword = await bcrypt.hash(password,10)

    await db.query(
        'INSERT INTO users (email, username, password) VALUES ($1,$2,$3)', [email, username, hashedPassword]
    )
    res.status(201).json({message: "registration is successful"})
})

// LOGIN

router.post('/login', async ( req:Request, res:Response)=> {
  const {identifier, password} = req.body

  const result = await db.query('SELECT * FROM users WHERE email = $1 OR username = $1', [identifier])
  const user = result.rows[0]

  if(!user){
    res.status(401).json({message: 'email/username or password is wrong'})
    return
  }

  const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        res.status(401).json({message:'email/username or passoword is wrong'})
        return
    }

    const token = jwt.sign({userId:user.id},  JWT_SECRET, {expiresIn:'7d'}) //its like an id card that includes userid,token,expiresdate

    res.cookie('token', token, {
        httpOnly:true,
        maxAge:7 * 24 * 60 * 60 * 1000
    })
    res.json({message: "login successfull !"})

} )

// LOGOUT
router.post('/logout', (req:Request, res,Response)=> {
    res.clearCookie('token')
    res.json({message:"logout successfull"})
})

// ME
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const result = await db.query(
    `SELECT id, email, username, bio, profile_picture, created_at,
       (SELECT COUNT(*) FROM follows WHERE following_id = users.id) AS followers_count,
       (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) AS following_count
     FROM users WHERE id = $1`,
    [(req as any).userId]
  );
  res.json(result.rows[0]);
});

// PROFILE PICTURE
router.post('/profile-picture', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'image is required' })
    return
  }

  const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`

  const result = await db.query(
    'UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING id, email, bio, profile_picture',
    [imageUrl, (req as any).userId]
  )

  res.json(result.rows[0])
})

// UPDATE BIO
router.patch('/bio', requireAuth, async (req: Request, res: Response) => {
  const { bio } = req.body

  const result = await db.query(
    'UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, email, bio, profile_picture',
    [bio, (req as any).userId]
  )

  res.json(result.rows[0])
})

export default router


