import { Transaction } from "@prisma/client";
import { Context } from "../types/context";

export const Query = {
  transactions: (_: unknown, __:unknown, ctx: Context) => {
    return ctx.prisma.transaction.findMany({
      include: {
        items: {
          include: {product: true}
        },
        createdBy: true
      }
    })
  }
}

export const Mutation = {
  createTransaction: async (
    _: unknown,
    args: {items: {productId: string; quantity: number}[] },
    ctx: Context
  ): Promise<Transaction> => {
    if(!ctx.user)
      throw new Error('Unauthorized')

    const products = await ctx.prisma.product.findMany({
      where: {
        id: {in: args.items.map(item => item.productId)}
      }
    })

    const total = args.items.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId)
      if(!product)
        throw new Error(`Product ${item.productId} not found`)
      
      return acc + product.price * item.quantity
    }, 0)

    return await ctx.prisma.transaction.create({
      data: {
        total,
        status: 'PENDING',
        createdById: ctx.user.id,
        items: {
          create: args.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: true,
        createdBy: true
      }
    })
  },

  cancelTransaction: async (
    _: unknown,
    args: {id: string},
    ctx: Context,
  ) => {
    const transaction = await ctx.prisma.transaction.findUnique({
      where: {id: args.id},
      include: {
        items: true
      }
    })

    if(!transaction) 
      throw new Error('Transaction Not Found!')

    if(transaction.status !== 'PENDING')
      throw new Error('Only pending transactions can be cancelled')

    for (const item of transaction.items){
      await ctx.prisma.product.update({
        where: {id: item.productId},
        data: {
          stock: {
            increment:  item.quantity
          }
        }
      })
    }

    return ctx.prisma.transaction.update({
      where: {id: args.id},
      data: {status: 'CANCELLED'},
      include: {
        items: {
          include: {product: true}
        },
        createdBy: true
      }
    })
  },

  payTransaction: async (
    _: unknown,
    args: { id: string },
    ctx: Context,
  ) => {
    const transaction = await ctx.prisma.transaction.findUnique({
      where: {id: args.id},
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    if(!transaction) 
      throw new Error('Transaction Not Found!')
    
    if(transaction.status !== 'PENDING')
      throw new Error('Only pending transaction can be paid')

    for (const item of transaction.items) {
      if(item.product.stock < item.quantity){
        throw new Error(`Insufficient stock product: ${item.product.name}`)
      }
    }

    for (const item of transaction.items) {
      await ctx.prisma.product.update({
        where: {id: item.productId},
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return ctx.prisma.transaction.update({
      where: {id: args.id},
      data: {status: 'PAID'},
      include: {
        items: {
          include: {product: true}
        },
        createdBy: true
      }
    })
  }
}