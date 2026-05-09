import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedTransactionData {
  description: string;
  amount: number | null;
}

export async function processImageDocument(file: File): Promise<ExtractedTransactionData> {
  try {
    const imageUrl = URL.createObjectURL(file);

    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m) => console.log('[v0] OCR Progress:', m),
    });

    const text = result.data.text;
    URL.revokeObjectURL(imageUrl);

    return extractDataFromText(text);
  } catch (error) {
    console.error('[v0] Image processing error:', error);
    throw new Error('Failed to process image. Please try again.');
  }
}

export async function processPdfDocument(file: File): Promise<ExtractedTransactionData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      fullText += text + ' ';
    }

    return extractDataFromText(fullText);
  } catch (error) {
    console.error('[v0] PDF processing error:', error);
    throw new Error('Failed to process PDF. Please try again.');
  }
}

function extractDataFromText(text: string): ExtractedTransactionData {
  // Remove extra whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Try to extract amount (looks for currency symbols or numbers)
  let amount: number | null = null;

  // Pattern 1: Look for currency amounts like $50.00, €100, etc.
  const currencyPattern = /[$€£¥₹]?\s*(\d+(?:[.,]\d{2})?)/g;
  const matches = cleanText.match(currencyPattern);
  if (matches) {
    const lastMatch = matches[matches.length - 1];
    const numStr = lastMatch.replace(/[$€£¥₹\s]/g, '').replace(',', '.');
    const parsed = parseFloat(numStr);
    if (!isNaN(parsed)) {
      amount = parsed;
    }
  }

  // Pattern 2: If no currency found, look for any decimal number
  if (amount === null) {
    const numberPattern = /(\d+\.?\d{0,2})/g;
    const nums = cleanText.match(numberPattern);
    if (nums && nums.length > 0) {
      const lastNum = nums[nums.length - 1];
      const parsed = parseFloat(lastNum);
      if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
        amount = parsed;
      }
    }
  }

  // Extract description (first few words that make sense)
  const words = cleanText.split(' ').filter((w) => w.length > 2);
  const description = words.slice(0, Math.min(5, words.length)).join(' ') || 'Receipt';

  return {
    description: description.substring(0, 100),
    amount,
  };
}

export async function processDocument(file: File): Promise<ExtractedTransactionData> {
  const fileType = file.type;

  if (fileType.startsWith('image/')) {
    return processImageDocument(file);
  } else if (fileType === 'application/pdf') {
    return processPdfDocument(file);
  } else {
    throw new Error('Unsupported file type. Please use JPG, PNG, WebP, or PDF.');
  }
}
