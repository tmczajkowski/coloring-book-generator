import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  dataDir: path.resolve(process.env.DATA_DIR || './data'),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  printerUri: process.env.PRINTER_URI || 'ipp://192.168.1.188/ipp/print',
  imageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
};

