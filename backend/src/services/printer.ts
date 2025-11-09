import fs from 'fs';
import ipp from 'ipp';
import sharp from 'sharp';
import { config } from '../config.ts';
import { logger } from '../utils/logger.ts';

export const printFile = async (filePath: string): Promise<string> => {
  const printer = ipp.Printer(config.printerUri);
  const data = fs.readFileSync(filePath);
  const docFormat = detectFormat(filePath);
  logger.info('IPP: Print-Job', { uri: config.printerUri, file: filePath, format: docFormat, bytes: data.byteLength });

  type SendResult = { jobId?: number | string, statusCode?: string, raw?: any };

  const trySendAs = async (format: string, buffer: Buffer): Promise<SendResult> => {
    // First try Create-Job + Send-Document (some printers behave better)
    try {
      const createMsg: any = {
        'operation-attributes-tag': {
          'requesting-user-name': 'Coloring App',
          'job-name': 'Kolorowanka',
          'document-format': format
        }
      };
      const createRes: any = await new Promise((resolve, reject) => {
        printer.execute('Create-Job', createMsg, (cerr: any, cres: any) => {
          if (cerr) return reject(cerr);
          resolve(cres);
        });
      });
      const createdJobId = createRes?.['job-attributes-tag']?.['job-id'];
      if (!createdJobId) throw new Error('Create-Job did not return job-id');

      const sendMsg: any = {
        'operation-attributes-tag': {
          'requesting-user-name': 'Coloring App',
          'job-id': Number(createdJobId),
          'document-format': format,
          // Important for IPP multi-document jobs to finish
          'last-document': true,
          // Optional but useful
          'document-name': `print.${format === 'image/jpeg' ? 'jpg' : format.split('/').pop()}`
        },
        data: buffer
      };
      const sendRes: any = await new Promise((resolve, reject) => {
        printer.execute('Send-Document', sendMsg, (serr: any, sres: any) => {
          if (serr) return reject(serr);
          resolve(sres);
        });
      });
      const statusCode = sendRes?.statusCode || createRes?.statusCode;
      const ok = typeof statusCode === 'string' && statusCode.startsWith('successful');
      if (!ok) {
        const code = sendRes?.statusCode || 'unknown-error';
        const err = new Error(`Send-Document failed: ${code}`);
        // Throw to trigger Print-Job fallback below
        (err as any).statusCode = code;
        throw err;
      }
      return { jobId: createdJobId, statusCode, raw: { createRes, sendRes } };
    } catch (e) {
      // Fall back to Print-Job
      const pjMsg: any = {
        'operation-attributes-tag': {
          'requesting-user-name': 'Coloring App',
          'job-name': 'Kolorowanka',
          'document-format': format
        },
        data: buffer
      };
      const pjRes: any = await new Promise((resolve, reject) => {
        printer.execute('Print-Job', pjMsg, (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      const jobId = pjRes?.['job-attributes-tag']?.['job-id'];
      return { jobId, statusCode: pjRes?.statusCode, raw: { pjRes } };
    }
  };

  // First attempt in original format
  let send = await trySendAs(docFormat, data);

  // If printer rejects format, convert to JPEG and retry (widely supported)
  const unsupported = send.statusCode === 'client-error-document-format-not-supported' || (!send.jobId && send.statusCode?.startsWith('client-error'));
  if (unsupported && docFormat.startsWith('image/')) {
    logger.warn('IPP: document format not supported, converting to JPEG and retrying', { file: filePath, originalFormat: docFormat });
    const jpegBuffer = await sharp(filePath).jpeg({ quality: 95 }).toBuffer();
    send = await trySendAs('image/jpeg', jpegBuffer);
  }

  // Log for diagnostics
  logger.info('IPP: raw Print-Job response', send.raw);

  const returnedJobId = send.jobId;
  if (!returnedJobId) {
    throw new Error('Printer did not return a job-id. Print-Job may not have been accepted.');
  }

  const jobId = String(returnedJobId);
  try {
    const queryMsg: any = {
      'operation-attributes-tag': {
        'requesting-user-name': 'Coloring App',
        'job-id': Number(returnedJobId),
        'requested-attributes': ['job-state', 'job-state-reasons', 'job-message', 'job-uri']
      }
    };
    const jobAttrs: any = await new Promise((resolve, reject) => {
      printer.execute('Get-Job-Attributes', queryMsg, (err: any, result: any) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
    logger.info('IPP: Job attributes', jobAttrs);
  } catch (qerr: any) {
    logger.warn('IPP: Could not fetch job attributes', { jobId, error: String(qerr?.message || qerr) });
  }

  logger.info('IPP: Print-Job result', { jobId });
  return jobId;
};

const detectFormat = (filePath: string) => {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
};
