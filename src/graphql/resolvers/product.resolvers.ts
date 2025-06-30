import { Context } from "../types/context";
import { Product } from "@prisma/client";
import { uploadProductImage } from "../../utils/upload";
import { FileUpload } from "graphql-upload-ts";
export const Query = {
  products: (_: unknown, __: {}, ctx: Context): Promise<Product[]> => {
    return ctx.prisma.product.findMany({
      include: { createdBy: true }
    })
  },
  product: (_: unknown, args: { id: string }, ctx: Context) => {
    return ctx.prisma.product.findUnique({ where: { id: args.id } })
  }
}

export const Mutation = {
  createProduct: async (
    _: unknown,
    { input }: { input: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'createdById'> & { file: FileUpload } },
    ctx: Context,
  ): Promise<Product> => {
    if (!ctx.user)
      throw new Error('Unauthorized')

    const imageUrl = await uploadProductImage(input.file)
    return ctx.prisma.product.create({
      data: {
        ...input,
        imageUrl,
        createdById: ctx.user.id
      }
    })
  },

  updateProduct: async (
    _: unknown,
    { input }: { input: Partial<Product> & { id: string } },

    ctx: Context
  ): Promise<Product> => {
    if (!ctx.user) throw new Error("Unauthorized");

    return ctx.prisma.product.update({
      where: { id: input.id },
      data: {
        ...input,
        id: undefined
      }
    })
  },

  deleteProduct: async (
    _: unknown,
    args: Product,
    ctx: Context
  ): Promise<Boolean> => {
    if (!ctx.user)
      throw new Error('Unauthorized')

    await ctx.prisma.product.delete({
      where: { id: args.id }
    })

    return true
  }
}
