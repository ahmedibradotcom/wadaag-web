import nc from 'next-connect'
import db from '../../../config/db'
import Chat from '../../../models/Chat'
import { isAuth } from '../../../utils/auth'

const schemaName = Chat

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      let query = schemaName.find({})

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await schemaName.countDocuments({})

      const pages = Math.ceil(total / pageSize)

      query = query.skip(skip).limit(pageSize).sort({ createdAt: -1 }).lean()

      const result = await query

      res.status(200).json({
        startIndex: skip + 1,
        endIndex: skip + result.length,
        count: result.length,
        page,
        pages,
        total,
        data: result,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { user, text, createdAt, secondUser } = req.body


      if (text === 'secret=ts=reject') {
        await Chat.remove({ $or: [{ sender: secondUser }, { sender: user }] })
        await Chat.remove({
          $or: [{ receiver: secondUser }, { receiver: user }],
        })
        return res.json('rejected')
      }

      const newPost = {
        text,
        createdAt,
        sender: user,
        receiver: secondUser,
      }

      const newChat = await schemaName.create(newPost)

      return res.status(200).send(newChat)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
