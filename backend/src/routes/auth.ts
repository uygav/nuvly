import {Router , Request, Response} from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../index'
import { requireAuth } from '../middleware/auth'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET!


// REGISTER 
router.post('/register', async(req:Request, res:Response)=> {
    
    const {email, password} = req.body

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if(existing.rows.length>0){
        res.status(400).json({message: 'this email is already created'})
        return
    }

    const hashedPassword = await bcrypt.hash(password,10)

    await db.query(
        'INSERT INTO users (email, password) VALUES ($1,$2)', [email, hashedPassword]
    ) 
    res.status(201).json({message: "registration is successful"})
})

// LOGIN

router.post('/login', async ( req:Request, res:Response)=> {
  const {email, password} = req.body 
  
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
  const user = result.rows[0]

  if(!user){
    res.status(401).json({message: 'email or password is wrong'})
    return
  }

  const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        res.status(401).json({message:'email or passoword is wrong'})
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
  const result = await db.query('SELECT id, email,bio, profile_picture, created_at FROM users WHERE id = $1', [(req as any).userId]);
  res.json(result.rows[0]);
});
    
export default router


