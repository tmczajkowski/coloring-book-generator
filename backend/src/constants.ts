export const APP_NAME = 'Coloring App';
export const JOB_NAME = 'Kolorowanka';

// Files and formats
export const IMAGE_BASENAME = 'image';
export const EXT_JPG = 'jpg';
export const EXT_PNG = 'png';
export const EXT_SVG = 'svg';
export const FILE_IMAGE_JPG = `${IMAGE_BASENAME}.${EXT_JPG}`;
export const FILE_IMAGE_PNG = `${IMAGE_BASENAME}.${EXT_PNG}`;
export const FILE_IMAGE_SVG = `${IMAGE_BASENAME}.${EXT_SVG}`;
export const IMAGE_A4_WIDTH = 2480; // ~210mm @ 300 DPI
export const IMAGE_A4_HEIGHT = 3508; // ~297mm @ 300 DPI

// Prompts
export const PROMPT_COLORING_BOOK = `Narysuj czarno-białą ilustrację do kolorowania (bez tła, brak szarości, brak cieniowania, brak wypełnień np. bluzek - tylko kontury, bez ramek, obrazek binarny - tylko czerń i biel). Nie dodawaj żadnego tekstu na obrazku, chyba że jest to wprost powiedziane (to, że chcę aby np. wygenerować Wiktora to nie znaczy, że chcę napis Wiktor). Jeśli podałem jakieś referencje (inlineData) to niech one będą szczegółowe i wiernie oddawały wysłane pliki jeśli chodzi o twarze. Temat: `;
export const PROMPT_IMPROVE = `Ulepsz ten prompt tak, aby powstała kolorowanka dla dzieci. Rozbuduj tylko zawartość kolorowanki, a nie to jak kolorowanka ma wyglądać od strony technicznej, bo tym zajmuje się coś innego. Zwróć tylko elementy na kolorowance i nic więcej. Oryginalny prompt: `;
export const PROMPT_DETECT_REFERENCES = `Wyszukaj wszystkie pliki referencyjne i zwróć je w postaci json: Odpowiedź musi być wyłącznie poprawnym JSON-em, bez dodatkowego tekstu. Możesz zwrócić pustą listę. Pliki referencyjne mają w jakikolwiek sposób pasować do promptu. Czyli jak prompt mówi o jakiejś postaci to zwróć pliki z tą postacią lub grupę pasującą do referencji. `;

// Printing defaults (IPP)
export const PRINTER_MEDIA_A4 = 'iso_a4_210x297mm';
export const PRINTER_SCALING_FIT = 'fit';
export const PRINTER_QUALITY_DRAFT = 3; // 3=draft, 4=normal, 5=high
export const PRINTER_DOCUMENT_NAME = FILE_IMAGE_JPG;
export const PRINTER_COLOR_MODE_MONO = 'monochrome';
export const PRINTER_OPTIMIZE_TEXT = 'text';
