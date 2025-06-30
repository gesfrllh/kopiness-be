import { UUIDTypes } from "uuid";

export interface Product { 
  name: string,
  price: number,
  id: UUIDTypes,
  stock: number,
  createdById: string,
}