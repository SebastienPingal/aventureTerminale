import { WorldCell as PrismaWorldCell } from "@/app/generated/prisma"

export type WorldCell = PrismaWorldCell

export interface WorldCellWithUsers extends WorldCell {
  users: Array<{
    id: string
    name: string
    email: string
  }>
} 