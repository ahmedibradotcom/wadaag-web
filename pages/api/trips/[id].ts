import nc from 'next-connect'
import db from '../../../config/db'
import Trip from '../../../models/Trip'
import { isAuth } from '../../../utils/auth'
import Chat from '../../../models/Chat'

const schemaName = Trip
const schemaNameString = 'Trip'

const handler = nc()
handler.use(isAuth)
handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const { actionStatus, finalDestination, finalDistance } = req.body

      const object = await schemaName.findById(id)
      if (!object)
        return res.status(400).json({ error: `${schemaNameString} not found` })

      if (actionStatus === 'cancelled') {
        object.status = 'cancelled'
        await object.save()
      }
      if (actionStatus === 'completed') {
        object.status = 'completed'
        // implement here the finished location and distance
        object.finalDestination = finalDestination
        object.finalDistance = finalDistance
        await object.save()
      }

      await Chat.remove({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      })

      res.status(200).json({ message: `${schemaNameString} ${actionStatus}` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

handler.delete(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const { status } = req.body

      return res.status(400).json({ error: 'error' })

      const object = await schemaName.findById(id)
      if (!object)
        return res.status(400).json({ error: `${schemaNameString} not found` })

      if (status === 'cancelled') {
        object.status = 'cancelled'
        await object.save()
      }
      if (status === 'completed') {
        object.status = 'completed'
        await object.save()
      }
      res.status(200).json({ message: `${schemaNameString} ${status}` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

// handler.delete(
//   async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
//     await db()
//     try {
//       const { id } = req.query
//       const object = await schemaName.findById(id)
//       if (!object)
//         return res.status(400).json({ error: `${schemaNameString} not found` })

//       await object.remove()
//       res.status(200).json({ message: `${schemaNameString} removed` })
//     } catch (error: any) {
//       res.status(500).json({ error: error.message })
//     }
//   }
// )

export default handler
