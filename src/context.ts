import { PrismaClient } from "@prisma/client";
import { Context } from "./graphql/types/context";
import jwt from 'jsonwebtoken'
import { Request } from "express";

const prisma = new PrismaClient()

export const createContext = async ({req}: {req: Request}): Promise<Context> => {
  const token = req.headers.authorization?.split(' ')[1];
  let user = null

  if(token){
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string}
      user = await prisma.user.findUnique({where : {id: decoded.id}})
    } catch {
      user = null
    }
  }
  return { prisma, user }
}