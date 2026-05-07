import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { socket_id, channel_name, user_id, user_name } = req.body

  if (!socket_id || !channel_name) {
    res.status(400).json({ error: 'Missing socket_id or channel_name' })
    return
  }

  const presenceData = channel_name.startsWith('presence-')
    ? {
        user_id,
        user_info: {
          name: user_name || user_id
        }
      }
    : undefined

  if (channel_name.startsWith('presence-') && !user_id) {
    res.status(400).json({ error: 'Missing user_id' })
    return
  }

  const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData)

  res.json(auth)
}
