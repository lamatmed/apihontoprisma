import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = new Hono()

app.use('*', cors())

// GET todos
app.get('/todos', async (c) => {
  const todos = await prisma.todo.findMany({ orderBy: { id: 'desc' } })
  return c.json(todos)
})

// POST todo
app.post('/todos', async (c) => {
  const body = await c.req.json()
  const todo = await prisma.todo.create({
    data: { text: body.text },
  })
  return c.json(todo, 201)
})

// PUT todo
app.put('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const updated = await prisma.todo.update({
    where: { id },
    data: { text: body.text },
  })
  return c.json(updated)
})

// DELETE todo
app.delete('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await prisma.todo.delete({ where: { id } })
  return c.json({ success: true })
})

export default app
