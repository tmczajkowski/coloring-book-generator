import fs from 'fs';
import ipp from 'ipp';
import sharp from 'sharp';
import { config } from '../config.ts';
import { logger } from '../utils/logger.ts';

export const printFile = async (filePath: string): Promise<string> => {
  const printer = ipp.Printer(config.printerUri);
  const lower = filePath.toLowerCase();
  let buffer = fs.readFileSync(filePath);
  const format = 'image/jpeg';

  // Always send low-quality JPEG to the printer to save ink/toner.
  // Recompress/convert with white background to avoid transparency issues.
  buffer = await sharp(buffer)
    //.flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 75 })
    .toBuffer();

  logger.info('IPP: Print-Job', { uri: config.printerUri, file: filePath, format, bytes: buffer.byteLength });

  const pjMsg: any = {
    'operation-attributes-tag': {
      'requesting-user-name': 'Coloring App',
      'job-name': 'Kolorowanka',
      'document-format': format,
      'document-name': 'image.jpg'
    },
    'job-attributes-tag': {
      // Force A4 media and scale the image to fit the page
      'media': 'iso_a4_210x297mm',
     // 'print-scaling': 'fit', wykomentowane bo
      // Request draft quality printing (3=draft, 4=normal, 5=high)
      'print-quality': 3,
      // Optimize for line art/text (if printer supports)
      'print-content-optimize': 'text'
    },
    data: buffer
  };

  const pjRes: any = await new Promise((resolve, reject) => {
    printer.execute('Print-Job', pjMsg, (err: any, result: any) => {
      if (err) return reject(err);
      resolve(result);
    });
  });

  logger.info('IPP: raw Print-Job response', { pjRes });
  const returnedJobId = pjRes?.['job-attributes-tag']?.['job-id'];
  if (!returnedJobId) {
    throw new Error('Printer did not return a job-id. Print-Job may not have been accepted.');
  }
  const jobId = String(returnedJobId);
  logger.info('IPP: Print-Job result', { jobId });
  return jobId;
};
