import { FastifyPluginAsync } from 'fastify'
import { GoogleGenAI } from '@google/genai'

const aiRoutes: FastifyPluginAsync = async (app) => {
  const auth = { onRequest: [app.authenticate] }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

  const schema = (type: 'list' | 'purchase') => type === 'list' ? {
    type: 'OBJECT' as any,
    properties: {
      clientName: { type: 'STRING' as any },
      blocks: {
        type: 'ARRAY' as any,
        items: {
          type: 'OBJECT' as any,
          properties: {
            supplierName: { type: 'STRING' as any },
            items: { type: 'ARRAY' as any, items: { type: 'OBJECT' as any, properties: { name: { type: 'STRING' as any }, quantity: { type: 'STRING' as any } }, required: ['name', 'quantity'] } }
          },
          required: ['supplierName', 'items']
        }
      }
    },
    required: ['clientName', 'blocks']
  } : {
    type: 'OBJECT' as any,
    properties: {
      destinations: {
        type: 'ARRAY' as any,
        items: {
          type: 'OBJECT' as any,
          properties: {
            name: { type: 'STRING' as any },
            items: { type: 'ARRAY' as any, items: { type: 'OBJECT' as any, properties: { supplier: { type: 'STRING' as any }, name: { type: 'STRING' as any }, quantity: { type: 'STRING' as any } }, required: ['supplier', 'name', 'quantity'] } }
          },
          required: ['name', 'items']
        }
      }
    },
    required: ['destinations']
  }

  // Parse lista de venda
  app.post('/parse-list', auth, async (req, reply) => {
    const { text } = req.body as any
    if (!text) return reply.status(400).send({ error: 'text obrigatório' })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Parse this WhatsApp grocery list into JSON. Items grouped by supplier in parentheses (e.g. (MAURO)). Extract clientName from headers.\n\n${text}` }] }],
      config: { responseMimeType: 'application/json', responseSchema: schema('list') },
    })
    return reply.send(JSON.parse(response.text!))
  })

  // Parse lista de compra
  app.post('/parse-purchase', auth, async (req, reply) => {
    const { text } = req.body as any
    if (!text) return reply.status(400).send({ error: 'text obrigatório' })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Parse this purchase list into JSON destinations/locations with items and suppliers.\n\n${text}` }] }],
      config: { responseMimeType: 'application/json', responseSchema: schema('purchase') },
    })
    return reply.send(JSON.parse(response.text!))
  })
}

export default aiRoutes
