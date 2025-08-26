import { Kafka, Partitioners, logLevel, Producer } from 'kafkajs'
import { getKafka } from '@/lib/kafka'

export type PresenceEvent = {
  type: 'user_entered' | 'user_left'
  worldCellId: string
  userId: string
  at: string
}

let cachedProducer: Producer | null = null
let producerReady = false
let connecting: Promise<void> | null = null

async function getProducer(): Promise<Producer> {
  const { kafka, ready } = getKafka()
  await ready
  if (cachedProducer) return cachedProducer
  cachedProducer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })
  if (!producerReady) {
    connecting = connecting || cachedProducer.connect().then(() => {
      producerReady = true
      console.log('📡 kafka producer ready')
    }).finally(() => { connecting = null })
    await connecting
  }
  return cachedProducer
}

export async function publishPresenceEventKafka(event: PresenceEvent) {
  const producer = await getProducer()
  try {
    await producer.send({
      topic: 'presence.events',
      messages: [
        { key: event.worldCellId, value: JSON.stringify(event) }
      ]
    })
  } catch (err: unknown) {
    const e = err as { message?: string }
    if ((e?.message || '').includes('disconnected')) {
      producerReady = false
      try {
        await producer.connect()
        producerReady = true
        await producer.send({
          topic: 'presence.events',
          messages: [
            { key: event.worldCellId, value: JSON.stringify(event) }
          ]
        })
      } catch (err2) {
        console.error('⚠️ failed to recover kafka producer send', err2)
        throw err2
      }
    } else {
      throw err
    }
  }
  console.log(`🔔 presence ${event.type} cell=${event.worldCellId} user=${event.userId}`)
}
