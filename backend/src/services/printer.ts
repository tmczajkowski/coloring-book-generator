import fs from 'fs';
import ipp from 'ipp';
import sharp from 'sharp';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { APP_NAME, JOB_NAME, PRINTER_COLOR_MODE_MONO, PRINTER_DOCUMENT_NAME, PRINTER_MEDIA_A4, PRINTER_OPTIMIZE_TEXT, PRINTER_QUALITY_DRAFT, PRINTER_SCALING_FIT } from '../constants.js';

export const printFile = async (filePath: string): Promise<string> => {
  const printer = ipp.Printer(config.printerUri);
  let buffer: Buffer = fs.readFileSync(filePath) as Buffer;
  const format = 'image/jpeg';

  {
    const out = await sharp(buffer as any)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .grayscale()
      .jpeg({ quality: 60, chromaSubsampling: '4:2:0' })
      .toBuffer();
    buffer = Buffer.from(out);
  }

  logger.info('IPP: Print-Job', { uri: config.printerUri, file: filePath, format, bytes: buffer.byteLength });

  // Preferowane atrybuty dla szybkiego druku line-art (kolorowanki)
  const fastAttrs: any = {
    'operation-attributes-tag': {
      'requesting-user-name': APP_NAME,
      'job-name': JOB_NAME,
      'document-format': format,
      'document-name': PRINTER_DOCUMENT_NAME
    },
    'job-attributes-tag': {
      'media': PRINTER_MEDIA_A4,
      'print-quality': PRINTER_QUALITY_DRAFT,
      'print-color-mode': PRINTER_COLOR_MODE_MONO,
      'print-content-optimize': PRINTER_OPTIMIZE_TEXT,
      'print-scaling': PRINTER_SCALING_FIT,
      'printer-resolution': { x: 300, y: 300, unit: 'dpi' }
    },
    data: buffer
  };

  // Fallback: jeśli drukarka odrzuci niektóre atrybuty IPP (np. print-color-mode), spróbuj ponownie z minimalnym zestawem
  const execPrint = (msg: any) => Promise.race([
    new Promise((resolve, reject) => {
      printer.execute('Print-Job', msg, (err: any, result: any) => {
        if (err) return reject(err);
        resolve(result);
      });
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Printer timeout')), 30_000))
  ]);

  let pjRes: any;
  try {
    pjRes = await execPrint(fastAttrs);
  } catch (e) {
    logger.warn('IPP: fast attributes rejected, retrying with minimal set', { error: String((e as any)?.message || e) });
    const minimal: any = {
      'operation-attributes-tag': fastAttrs['operation-attributes-tag'],
      'job-attributes-tag': {
        'media': PRINTER_MEDIA_A4,
        'print-quality': PRINTER_QUALITY_DRAFT
      },
      data: buffer
    };
    pjRes = await execPrint(minimal);
  }

  logger.info('IPP: raw Print-Job response', { pjRes });
  const jobAttrs = pjRes?.['job-attributes-tag'] || {};
  const returnedJobId = jobAttrs['job-id'];
  const returnedJobUri = jobAttrs['job-uri'];
  const status = pjRes?.statusCode || pjRes?.status || 'unknown';

  if (returnedJobId) {
    const jobId = String(returnedJobId);
    logger.info('IPP: Print-Job result', { jobId, status });
    return jobId;
  }

  // Some printers don't return job-id but still accept the job; prefer job-uri or synthesize an id
  const fallbackId = returnedJobUri ? String(returnedJobUri) : `job-${Date.now()}`;
  logger.warn('IPP: Missing job-id in response; proceeding with fallback id', { status, fallbackId, jobAttrs });
  return fallbackId;
};
