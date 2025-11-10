export const APP_NAME = 'Coloring App';
export const JOB_NAME = 'Kolorowanka';

// Files and formats
export const IMAGE_BASENAME = 'image';
export const EXT_JPG = 'jpg';
export const EXT_PNG = 'png';
export const FILE_IMAGE_JPG = `${IMAGE_BASENAME}.${EXT_JPG}`;
export const FILE_IMAGE_PNG = `${IMAGE_BASENAME}.${EXT_PNG}`;

// OpenAI image defaults
export const OPENAI_IMAGE_SIZE = '1536x1024';
export const OPENAI_IMAGE_QUALITY = 'high';

// Printing defaults (IPP)
export const PRINTER_MEDIA_A4 = 'iso_a4_210x297mm';
export const PRINTER_SCALING_FIT = 'fit';
export const PRINTER_QUALITY_DRAFT = 3; // 3=draft, 4=normal, 5=high
export const PRINTER_DOCUMENT_NAME = FILE_IMAGE_JPG;

