import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha2.js'
import { createAdminClient } from '@supabase/server/core'

ed.hashes.sha512 = sha512

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: -1, message: 'Method not allowed' })
    return
  }

  const { sync_id, signature } = req.body
  if (!sync_id || !signature) {
    res.status(400).json({
      code: -1,
      message: 'Missing sync_id or signature'
    })
    return
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('simple_bench_backups')
    .select('public_key, version, payload')
    .eq('sync_id', sync_id)
    .maybeSingle()

  if (!existing) {
    res
      .status(404)
      .json({ code: -1, message: 'No backup found for this sync_id' })
    return
  }

  const ok = ed.verify(
    Buffer.from(signature, 'hex'),
    Buffer.from(sync_id, 'utf-8'),
    Buffer.from(existing.public_key, 'hex')
  )

  if (!ok) {
    res.status(401).json({ code: -1, message: 'Invalid signature' })
    return
  }

  const payloadHex = existing.payload
  const payloadBuffer = payloadHex
    ? Buffer.from(payloadHex.replace(/^\\x/, ''), 'hex')
    : Buffer.alloc(0)

  res.setHeader('content-type', 'application/octet-stream')
  res.setHeader('x-backup-version', String(existing.version))
  res.end(payloadBuffer)
}
