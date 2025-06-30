import { UUIDTypes } from "uuid";
import { Product } from "./product.types";
import { User } from "@prisma/client";

export type TransactionStatusType = "PAID" | "PENDING" | "CANCELLED"

export interface Transaction{
  id: UUIDTypes
  total: number
  status: TransactionStatusType
  items: TransactionItem[]
  createdAt: string
  createdBy: User
  createdById: string
}


export interface TransactionItem {
  id: UUIDTypes
  quantity: number
  product: Product
  productId: string
  transaction: Transaction
  transactionId: string
}