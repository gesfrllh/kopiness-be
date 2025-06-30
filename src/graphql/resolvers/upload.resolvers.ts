import { GraphQLUpload } from "graphql-upload-ts";
import { uploadProductImage } from "../../utils/upload";
import { FileUpload } from "graphql-upload-ts";

export default {
  Upload: GraphQLUpload,
  Mutation: {
    uploadProductImage: async(
      _: unknown,
      { file }: { file: FileUpload }
    ): Promise<string> => {
      const imageUrl = await uploadProductImage(file)
      if(!imageUrl) 
        throw new Error('Failed to upload image')

      return imageUrl
    }
  }
}