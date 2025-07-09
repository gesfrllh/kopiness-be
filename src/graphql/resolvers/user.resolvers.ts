import { User, UserRole } from "@prisma/client";
import { Context } from "../types/context";
import { Register, Login } from "../types/user.types";
import argon2 from 'argon2'
import jwt from "jsonwebtoken";


export const Query = {
  me: (_: unknown, __: {}, ctx: Context): User | null => {
    return ctx.user ?? null;
  }
}

export const Mutation = {
  register: async (
    _: unknown,
    args: { input: Register },
    ctx: Context
  ): Promise<User> => {
    const { email, password, role, name } = args.input

    const exist = await ctx.prisma.user.findUnique({
      where: { email: email }
    })

    if (exist)
      throw new Error('Email already registered')

    const hashed = await argon2.hash(password)

    return ctx.prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashed,
        role: role as UserRole
      }
    })
  },

  login: async (
    __: unknown,
    args: { input: Login },
    ctx: Context
  ): Promise<{ token: string, user: User }> => {
    const { email, password } = args.input

    const user = await ctx.prisma.user.findUnique({
      where: { email },
    })

    if (!user) throw new Error('Invalid credentials')

    const valid = await argon2.verify(user.password, password)
    if (!valid) throw new Error('Invalid credentials')

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1d'
    })

    const { password: _, ...safeUser } = user

    return {
      token,
      user: safeUser as User
    }
  },

  logout: async (
    _: unknown,
    __: {},
    ctx: Context): Promise<boolean> => {
    const authHeader = ctx.req?.headers.authorization;
    const token = authHeader?.split(' ')[1]

    if (!token) return false

    return true
  }
}