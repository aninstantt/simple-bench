import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite-plus'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const env = loadEnv('development', rootDir, '')

for (const [key, value] of Object.entries(env)) {
  if (process.env[key] === undefined) {
    process.env[key] = value
  }
}

const apiProxyTarget =
  process.env.API_PROXY_TARGET ||
  env.API_PROXY_TARGET ||
  'http://127.0.0.1:3001'
const apiProxyUrl = new URL(apiProxyTarget)
const port = Number(
  apiProxyUrl.port || (apiProxyUrl.protocol === 'https:' ? 443 : 80)
)
const hostname = apiProxyUrl.hostname || 'localhost'
const { default: pusherAuthHandler } = await import('../api/pusher-auth.js')
const { default: pusherSendHandler } = await import('../api/pusher-send.js')

const routes = new Map([
  ['/api/pusher-auth', pusherAuthHandler],
  ['/api/pusher-send', pusherSendHandler]
])

const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url || '/', apiProxyTarget).pathname
    const handler = routes.get(pathname)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (!handler) {
      sendJson(res, 404, { error: 'Not found' })
      return
    }

    req.body = await readBody(req)
    decorateResponse(res)

    await handler(req, res)

    if (!res.writableEnded) {
      res.end()
    }
  } catch (error) {
    console.error(error)

    if (!res.writableEnded) {
      sendJson(res, 500, { error: 'Internal server error' })
    }
  }
})

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.info(`Local API server already listening on ${apiProxyTarget}`)
    process.exit(0)
  }

  throw error
})

server.listen(port, hostname, () => {
  console.info(`Local API server listening on ${apiProxyTarget}`)
})

function decorateResponse(res) {
  res.status = code => {
    res.statusCode = code
    return res
  }

  res.json = data => {
    if (!res.headersSent) {
      res.setHeader('content-type', 'application/json')
    }

    res.end(JSON.stringify(data))
    return res
  }

  res.send = data => {
    if (typeof data === 'object' && data !== null && !Buffer.isBuffer(data)) {
      return res.json(data)
    }

    res.end(data)
    return res
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'content-type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return {}
  }

  const rawBody = await readRawBody(req)
  const contentType = req.headers['content-type'] || ''

  if (!rawBody) {
    return {}
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(rawBody)
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(rawBody))
  }

  return rawBody
}

async function readRawBody(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString('utf8')
}
