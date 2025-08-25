import { Partitioners } from 'kafkajs'
import { getKafka } from '@/lib/kafka'

export type PresenceEvent = {
  type: 'user_entered' | 'user_left'
  worldCellId: string
  userId: string
  at: string
}

let producerReady = false

async function getProducer() {
  const { kafka, ready } = getKafka()
  await ready
  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })
  if (!producerReady) {
    await producer.connect()
    producerReady = true
    console.log('📡 kafka producer ready')
  }
  return producer
}

export async function publishPresenceEventKafka(event: PresenceEvent) {
  const producer = await getProducer()
  await producer.send({
    topic: 'presence.events',
    messages: [
      { key: event.worldCellId, value: JSON.stringify(event) }
    ]
  })
  console.log(`🔔 presence ${event.type} cell=${event.worldCellId} user=${event.userId}`)
}
