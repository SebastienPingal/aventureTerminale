import { User as PrismaUser, WorldCell as PrismaWorldCell } from "@/app/generated/prisma"

export type User = PrismaUser
export type WorldCell = PrismaWorldCell

export interface WorldCellWithUsers extends WorldCell {
  users: Array<{
    id: string
    name: string
    email: string
  }>
}

export type ExtendedUser = User & {
  worldCell?: WorldCell
}