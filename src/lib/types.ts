import { User as PrismaUser, WorldCell as PrismaWorldCell, Loot as PrismaObject, JournalEntry as PrismaJournalEntry, UserTrace as PrismaUserTrace, UserTraceType as PrismaUserTraceType } from "@prisma/client"

export type User = PrismaUser
export type WorldCell = PrismaWorldCell
export type Loot = PrismaObject
export type JournalEntry = PrismaJournalEntry
export type UserTrace = PrismaUserTrace
export type UserTraceType = PrismaUserTraceType

export interface WorldCellWithUsers extends WorldCell {
  users: Array<{
    id: string
    name: string
    email: string
  }>
}

export interface ExtendedWorldCell extends WorldCell {
  users?: Array<User>
  traces?: Array<UserTrace>
}

export type ExtendedUser = User & {
  worldCell?: ExtendedWorldCell
  inventory?: Loot[]
  journal?: JournalEntry[]
}