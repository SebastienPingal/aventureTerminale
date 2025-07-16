"use server"

import { Prisma } from "@/app/generated/prisma"
import prisma from "@/lib/prisma"
import { ExtendedUser } from "@/lib/types"
import { auth } from "@/auth"

export async function getUser(id: Prisma.UserWhereUniqueInput): Promise<ExtendedUser | null> {
  const user = await prisma.user.findUnique({
    where: id,
    include: {
      worldCell: true,
    },
  })

  return user
}

export async function updateUser(id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<ExtendedUser | null> {
  const user = await prisma.user.update({
    where: id,
    data,
    include: {
      worldCell: true,
    },
  })

  return user
}

export async function getMe(): Promise<ExtendedUser | null> {
  const session = await auth()
  if (!session?.user) {
    return null
  }

  const me = await getUser({ id: session.user.id })

  return me
}