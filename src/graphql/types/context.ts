import { PrismaClient, User } from "@prisma/client";
import { Request } from "express";

export interface Context {
  prisma: PrismaClient,
  req?: Request,
  user?: User | null
}