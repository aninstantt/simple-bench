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

  const { channelName, senderId, text } = req.body

  if (!channelName || !senderId || !text) {
    res.status(400).json({ error: 'Missing channelName, senderId, or text' })
    return
  }

  const message = {
    id: crypto.randomUUID(),
    text,
    senderId,
    createdAt: new Date().toISOString()
  }

  await pusher.trigger(channelName, 'share-message', message)

  res.json({ message })
}
