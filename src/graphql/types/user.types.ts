export type UserRole = "ADMIN" | "CUSTOMER"

export interface Register {
  name: string,
  email: string,
  password: string
  role: UserRole
}

export interface Login {
  email: string,
  password: string
}

