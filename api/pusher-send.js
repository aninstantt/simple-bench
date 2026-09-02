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

  const body = req.body || {}
  const { channelName, senderId, senderName, text } = body

  if (!channelName || !senderId || !text) {
    res.status(400).json({
      error: 'Missing channelName, senderId, or text'
    })
    return
  }

  const message = {
    id: crypto.randomUUID(),
    text,
    senderId,
    senderName: senderName || senderId,
    createdAt: new Date().toISOString()
  }

  try {
    await pusher.trigger(channelName, 'share-message', message)
  } catch {
    res.status(400).json({ error: 'Invalid channelName or failed to send' })
    return
  }

  res.json({ message })
}
