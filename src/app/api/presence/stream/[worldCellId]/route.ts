import { NextRequest } from 'next/server'
import { subscribeToCell } from '@/lib/events/presenceBus'
import { startPresenceBridge } from '@/lib/events/presenceBridge'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ worldCellId: string }> }) {
  await startPresenceBridge()

  const encoder = new TextEncoder()
  const { worldCellId } = await params

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      const unsubscribe = subscribeToCell(worldCellId, e => send(e))
      send({ type: 'connected', worldCellId })

      req.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}