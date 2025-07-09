import type { Application } from 'express'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs, resolvers } from './graphql'
import { graphqlUploadExpress } from 'graphql-upload-ts'
import dotenv from 'dotenv'
import { AuthMiddleware } from './middleware/auth.middleware'

dotenv.config()

const app: Application = express()
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const ctx = await AuthMiddleware(req);
      return ctx
    }
  })

  await server.start()
  server.applyMiddleware({ app })

  const PORT = process.env.PORT || 8000
  app.listen(PORT, () => {
    console.log(`Graphql Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  })
}

startServer();

app.use(graphqlUploadExpress())