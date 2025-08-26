import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { initializeUserPosition } from '@/actions/user'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const name = (body?.name as string | undefined) || `Tester ${Math.floor(Math.random() * 100000)}`
    const email = (body?.email as string | undefined) || `tester+${Date.now()}@local.dev`

    const user = await prisma.user.create({
      data: { name, email }
    })

    console.log('🧪 created test user', { id: user.id, email: user.email })

    const initialized = await initializeUserPosition(user.id)

    return new Response(JSON.stringify({ success: true, user: initialized ?? user }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    })
  } catch (err) {
    console.error('🧪 failed to create test user', err)
    return new Response(JSON.stringify({ success: false, error: 'failed_to_create_user' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
}


