import { User as PrismaUser, WorldCell as PrismaWorldCell, Loot as PrismaObject } from "@/app/generated/prisma"

export type User = PrismaUser
export type WorldCell = PrismaWorldCell
export type Loot = PrismaObject

export interface WorldCellWithUsers extends WorldCell {
  users: Array<{
    id: string
    name: string
    email: string
  }>
}

export interface ExtendedWorldCell extends WorldCell {
  users?: Array<User>
}

export type ExtendedUser = User & {
  worldCell?: ExtendedWorldCell
  inventory?: Loot[]
}