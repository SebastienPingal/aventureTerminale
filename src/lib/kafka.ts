// src/lib/kafka.ts
import { Kafka, logLevel } from 'kafkajs'

const globalKey = '__adventure_kafka_singleton__' as const

type KafkaSingleton = {
  kafka: Kafka
  ready: Promise<void>
}

function createKafka(): KafkaSingleton {
  const brokers = process.env.KAFKA_BROKERS?.split(',').map(s => s.trim()).filter(Boolean) ?? ['localhost:29092']

  const kafka = new Kafka({
    clientId: 'adventure-terminal',
    brokers,
    logLevel: logLevel.NOTHING
  })

  const ready = (async () => {
    const admin = kafka.admin()
    await admin.connect()
    try {
      await admin.createTopics({
        topics: [
          { topic: 'presence.events', numPartitions: 6, replicationFactor: 1 }
        ],
        waitForLeaders: true
      })
      console.log('🧭 kafka topics ensured')
    } finally {
      await admin.disconnect()
    }
  })()

  return { kafka, ready }
}

export function getKafka(): KafkaSingleton {
  const g = globalThis as unknown as Record<string, KafkaSingleton | undefined>
  if (!g[globalKey]) g[globalKey] = createKafka()
  return g[globalKey]!
}
