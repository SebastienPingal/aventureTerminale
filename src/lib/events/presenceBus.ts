import type { PresenceEvent } from './presenceKafka'

const subscribers = new Map<string, Set<(e: PresenceEvent) => void>>()

export function subscribeToCell(worldCellId: string, cb: (e: PresenceEvent) => void) {
  if (!subscribers.has(worldCellId)) subscribers.set(worldCellId, new Set())
  subscribers.get(worldCellId)!.add(cb)
  return () => subscribers.get(worldCellId)!.delete(cb)
}

export function pushToBus(e: PresenceEvent) {
  const set = subscribers.get(e.worldCellId)
  if (!set) return
  for (const cb of set) cb(e)
}
