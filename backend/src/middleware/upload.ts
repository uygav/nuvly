import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${(req as any).userId}-${Date.now()}${ext}`)
  }
})

export const upload = multer({ storage })
