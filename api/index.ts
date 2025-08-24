import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client'

// ⚠️ Important : Singleton Prisma pour éviter "too many connections"
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'], // optionnel
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const app = new Hono()

app.use('*', cors())

// GET todos
app.get('/todos', async (c) => {
  try {
    const todos = await prisma.todo.findMany({ orderBy: { id: 'desc' } })
    return c.json(todos)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Database error' }, 500)
  }
})

// POST todo
app.post('/todos', async (c) => {
  try {
    const body = await c.req.json()
    const todo = await prisma.todo.create({
      data: { text: body.text },
    })
    return c.json(todo, 201)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Database error' }, 500)
  }
})

// PUT todo
app.put('/todos/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    const body = await c.req.json()
    const updated = await prisma.todo.update({
      where: { id },
      data: { text: body.text },
    })
    return c.json(updated)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Database error' }, 500)
  }
})

// DELETE todo
app.delete('/todos/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    await prisma.todo.delete({ where: { id } })
    return c.json({ success: true })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Database error' }, 500)
  }
})

export default app
