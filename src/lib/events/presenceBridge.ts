import { getKafka } from '@/lib/kafka'
import { pushToBus } from './presenceBus'

let started = false

export async function startPresenceBridge() {
  if (started) return
  const { kafka, ready } = getKafka()
  await ready
  const consumer = kafka.consumer({ groupId: 'presence-broadcaster' })
  await consumer.connect()
  await consumer.subscribe({ topic: 'presence.events', fromBeginning: false })
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return
      const e = JSON.parse(message.value.toString())
      pushToBus(e)
    }
  })
  started = true
  console.log('🔌 presence bridge started')
}
