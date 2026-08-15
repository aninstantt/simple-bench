import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha2.js'
import { createAdminClient } from '@supabase/server/core'

ed.hashes.sha512 = sha512

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: -1, message: 'Method not allowed' })
    return
  }

  const rawBody = req.rawBody || (await readRawBody(req))
  const contentType = req.headers['content-type'] || ''
  const boundary = contentType.match(/boundary=(.+)/)?.[1]
  const body = boundary ? parseMultipart(rawBody, boundary) : {}

  const sync_id = body.sync_id
  const version = body.version
  const signature = body.signature
  const file = body.file
  const force = body.force === 'true'

  if (!sync_id || version == null || !signature || !file) {
    res.status(400).json({
      code: -1,
      message: 'Missing sync_id, version, signature, or file'
    })
    return
  }

  const clientVersion = Number(version)
  const payloadBuffer = file.data

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('simple_bench_backups')
    .select('version, public_key')
    .eq('sync_id', sync_id)
    .maybeSingle()

  if (!existing) {
    res
      .status(404)
      .json({ code: -1, message: 'No backup found for this sync_id' })
    return
  }

  const { public_key, version: serverVersion } = existing

  const ok = ed.verify(
    Buffer.from(signature, 'hex'),
    payloadBuffer,
    Buffer.from(public_key + 1, 'hex')
  )

  if (!ok) {
    res.status(401).json({ code: -1, message: 'Invalid signature' })
    return
  }

  if (!force && serverVersion > clientVersion) {
    res.status(409).json({
      code: -1,
      message: 'Server version is newer',
      data: {
        server_version: serverVersion,
        client_version: clientVersion
      }
    })
    return
  }

  const hexPayload = '\\x' + payloadBuffer.toString('hex')

  const { data, error: updateError } = await supabase
    .from('simple_bench_backups')
    .update({ payload: hexPayload, version: serverVersion + 1 })
    .eq('sync_id', sync_id)
    .select()
    .single()

  if (updateError) {
    res.status(500).json({ code: -1, message: updateError.message })
    return
  }

  res.status(200).json({ code: 0, data })
}

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

function parseMultipart(body, boundary) {
  const parts = {}
  const delimiter = Buffer.from(`--${boundary}`)
  const crlf = Buffer.from('\r\n')
  let start = 0

  while (start < body.length) {
    const headerStart = body.indexOf(delimiter, start)
    if (headerStart === -1) break

    const partStart = headerStart + delimiter.length

    if (body.subarray(partStart, partStart + 2).equals(Buffer.from('--'))) {
      break
    }

    const afterDelim = body.indexOf(crlf, partStart)
    if (afterDelim === -1) break

    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), afterDelim + 2)
    if (headerEnd === -1) break

    const headerBlock = body
      .subarray(afterDelim + 2, headerEnd)
      .toString('utf8')
    const nameMatch = headerBlock.match(/name="([^"]+)"/)
    const filenameMatch = headerBlock.match(/filename="([^"]+)"/)
    const name = nameMatch?.[1]

    if (!name) {
      start = headerEnd + 4
      continue
    }

    const dataStart = headerEnd + 4
    const nextDelim = body.indexOf(delimiter, dataStart)
    const dataEnd = nextDelim !== -1 ? nextDelim - 2 : body.length

    const data = body.subarray(dataStart, dataEnd)

    if (filenameMatch) {
      parts[name] = { filename: filenameMatch[1], data }
    } else {
      parts[name] = data.toString('utf8')
    }

    start = dataStart
  }

  return parts
}
