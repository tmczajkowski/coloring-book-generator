import fs from 'fs';
import ipp from 'ipp';
import sharp from 'sharp';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { APP_NAME, JOB_NAME, PRINTER_DOCUMENT_NAME, PRINTER_MEDIA_A4, PRINTER_QUALITY_DRAFT, PRINTER_SCALING_FIT } from '../constants.js';

export const printFile = async (filePath: string): Promise<string> => {
  const printer = ipp.Printer(config.printerUri);
  let buffer: Buffer = fs.readFileSync(filePath) as Buffer;
  const format = 'image/jpeg';

  {
    const out = await sharp(buffer as any)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 75 })
      .toBuffer();
    buffer = Buffer.from(out);
  }

  logger.info('IPP: Print-Job', { uri: config.printerUri, file: filePath, format, bytes: buffer.byteLength });

  const pjMsg: any = {
    'operation-attributes-tag': {
      'requesting-user-name': APP_NAME,
      'job-name': JOB_NAME,
      'document-format': format,
      'document-name': PRINTER_DOCUMENT_NAME
    },
    'job-attributes-tag': {
      'media': PRINTER_MEDIA_A4,
      'print-quality': PRINTER_QUALITY_DRAFT,
      'print-content-optimize': 'graphic'
    },
    data: buffer
  };

  const pjRes: any = await Promise.race([
    new Promise((resolve, reject) => {
      printer.execute('Print-Job', pjMsg, (err: any, result: any) => {
        if (err) return reject(err);
        resolve(result);
      });
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Printer timeout')), 30_000))
  ]);

  logger.info('IPP: raw Print-Job response', { pjRes });
  const returnedJobId = pjRes?.['job-attributes-tag']?.['job-id'];
  if (!returnedJobId) {
    throw new Error('Printer did not return a job-id. Print-Job may not have been accepted.');
  }
  const jobId = String(returnedJobId);
  logger.info('IPP: Print-Job result', { jobId });
  return jobId;
};
