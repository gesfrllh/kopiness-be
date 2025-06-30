import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'
import path from 'path'

const typesArray = loadFilesSync(path.join(__dirname, './schemas/**/*.graphql'))
const resolversArray = loadFilesSync(path.join(__dirname, './resolvers/**/*.{ts,js}'))

export const typeDefs = mergeTypeDefs(typesArray)
export const resolvers = mergeResolvers([
  ...resolversArray
])