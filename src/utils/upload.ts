// src/utils/upload.ts
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import type { FileUpload } from 'graphql-upload-ts'

export const uploadProductImage = async (file: FileUpload): Promise<string | null> => {
  const { filename, createReadStream } = await file
  const stream = createReadStream()

  const buffer: Buffer = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })

  const fileExt = filename.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `products/${fileName}`

  console.log('[UPLOAD] filePath:', filePath)
  console.log('[UPLOAD] buffer size:', buffer.length)

  const { error } = await supabase.storage
    .from('product-images') // <- pastikan nama bucket bener
    .upload(filePath, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (error) {
    console.error('[UPLOAD ERROR]', error.message)
    return null
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

