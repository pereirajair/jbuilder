import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '5mb' }))

function getViewPath(project, view) {
  return path.join(__dirname, 'projects', project, 'views', `${view}.json`)
}

app.get('/api/read/:project/:view', (req, res) => {
  try {
    const filePath = getViewPath(req.params.project, req.params.view)
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' })
    const data = fs.readFileSync(filePath, 'utf-8')
    res.json(JSON.parse(data))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/save/:project/:view', (req, res) => {
  try {
    const filePath = getViewPath(req.params.project, req.params.view)
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2))
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/formPost', (req, res) => {
  try {
    console.log(req.body);
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const port = process.env.API_PORT || 3001
app.listen(port, () => console.log(`API listening on :${port}`))
