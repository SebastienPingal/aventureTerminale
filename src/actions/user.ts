import { Prisma } from "@/app/generated/prisma"
import prisma from "@/lib/prisma"
import { User } from "@/lib/types"

export async function getUser(id: Prisma.UserWhereUniqueInput): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: id,
  })

  return user
}

export async function updateUser(id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<User | null> {
  const user = await prisma.user.update({
    where: id,
    data,
  })

  return user
}