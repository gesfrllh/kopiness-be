import { Request } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient()

export interface AuthContext {
  req: Request,
  user?: User,
  prisma: PrismaClient,
}


export const AuthMiddleware = async (req: Request): Promise<Partial<AuthContext>> => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) return { prisma }

  try {
    const isBlacklisted = await prisma.blacklistedToken.findUnique({
      where: { token }
    })

    if (isBlacklisted) {
      console.log('Token Has been blacklisted')
      return { prisma }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) return { prisma }

    return { prisma, user }
  } catch (err) {
    return { prisma }
  }
}