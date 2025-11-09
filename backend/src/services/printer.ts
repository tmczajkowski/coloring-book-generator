import fs from 'fs';
import ipp from 'ipp';
import { config } from '../config.ts';
import { logger } from '../utils/logger.ts';

export const printFile = async (filePath: string): Promise<string> => {
  const printer = ipp.Printer(config.printerUri);
  const data = fs.readFileSync(filePath);
  const docFormat = detectFormat(filePath);
  logger.info('IPP: Print-Job', { uri: config.printerUri, file: filePath, format: docFormat, bytes: data.byteLength });
  const msg: any = {
    'operation-attributes-tag': {
      'requesting-user-name': 'Coloring App',
      'job-name': 'Kolorowanka',
      'document-format': docFormat
    },
    data
  };
  const res: any = await new Promise((resolve, reject) => {
    printer.execute('Print-Job', msg, (err: any, result: any) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
  const jobId = res?.['job-attributes-tag']?.['job-id'] || `job-${Date.now()}`;
  logger.info('IPP: Print-Job result', { jobId });
  return String(jobId);
};

const detectFormat = (filePath: string) => {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
};
