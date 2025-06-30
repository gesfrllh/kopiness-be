export interface Register {
  name: string,
  email: string,
  password: string
  role: string
}

export interface Login {
  email: string,
  password: string
}