import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

// Initialize Pinecone and OpenAI
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})
const openai = new OpenAI()

export async function POST(req) {
  try {
    const data = await req.json()

    // Create an embedding for the manufacturer description
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: data.description,
      encoding_format: 'float',
    })
    const embedding = embeddingResponse.data[0].embedding

    // Format the Pinecone data structure
    const manufacturerData = {
      values: embedding,
      id: data.name, // Using the manufacturer name as the ID
      metadata: {
        location: data.location,
        description: data.description,
        categories: data.categories, // Store as comma-separated categories
      },
    }

    // Insert the manufacturer data into Pinecone
    const index = pc.index('harvest-ai').namespace('ns1')
    const upsertResponse = await index.upsert({
      vectors: [manufacturerData],
    })

    return NextResponse.json({
      message: `Manufacturer ${data.name} added successfully!`,
      upserted: upsertResponse.upserted_count,
    })
  } catch (error) {
    console.error('Error adding manufacturer:', error)
    return NextResponse.json({ error: 'Failed to add manufacturer' }, { status: 500 })
  }
}
