export const APP_NAME = 'Coloring App';
export const JOB_NAME = 'Kolorowanka';

// Files and formats
export const IMAGE_BASENAME = 'image';
export const EXT_JPG = 'jpg';
export const EXT_PNG = 'png';
export const FILE_IMAGE_JPG = `${IMAGE_BASENAME}.${EXT_JPG}`;
export const FILE_IMAGE_PNG = `${IMAGE_BASENAME}.${EXT_PNG}`;
export const IMAGE_A4_WIDTH = 2480; // ~210mm @ 300 DPI
export const IMAGE_A4_HEIGHT = 3508; // ~297mm @ 300 DPI

// Prompts
export const PROMPT_COLORING_BOOK = `Narysuj czarno-białą ilustrację do kolorowania (bez tła, brak szarości, brak cieniowania, brak wypełnień np. bluzek - tylko nontury, bez ramek, obrazek binanry - tylko czerń i biel). Nie dodawaj żadnego tekstu na obrazku, chyba ze jest to wprost powiedziane (to, że chce aby np. wygenerować Wiktora to nie znaczy, że chce napis Wiktor). Jeeli podałem jakieś referencje (inlineData) to niech one będą szczegółowe i wiernie oddawala wyslane pliki jezeli chodzi o twarze. Temat: `;
export const PROMPT_IMPROVE = `Ulepsz ten prompt tak, aby powstała kolorowanka dla dzieci. Rozbuduj tylko  zawarotść kolorowanki, a nie to jak kolorowanka ma wygladać od storny technicznej, bo tym zajmuje sie coś innego. Zwroć tylko elementy na kolorowance i nic wiecej. Oryginalny prompt: `;
export const PROMPT_DETECT_REFERENCES = `Wyszukaj wszystkie pliki referencyjne i zwróć je w postaci json: { "references": ["plik1.jpg", "plik2.png"] } — tylko istniejące nazwy. Odpowiedź musi być wyłącznie poprawnym JSON-em, bez dodatkowego tekstu. Możesz zwrócić pustą listę. Pliki referencyjne mają w jakikolwiek sposób pasować do promta. np. jak jest plik Patryk - Tata.jpg i w jakikolwiek sposób wspomnę o tacie lub Patryku to masz zwrócić ten plik jeeli pasuje doo tego prompta.`;

// Printing defaults (IPP)
export const PRINTER_MEDIA_A4 = 'iso_a4_210x297mm';
export const PRINTER_SCALING_FIT = 'fit';
export const PRINTER_QUALITY_DRAFT = 3; // 3=draft, 4=normal, 5=high
export const PRINTER_DOCUMENT_NAME = FILE_IMAGE_JPG;
export const PRINTER_COLOR_MODE_MONO = 'monochrome';
export const PRINTER_OPTIMIZE_TEXT = 'text';
