import { BadRequestException, Injectable } from '@nestjs/common';
import mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as path from 'path';

const CHUNK_SIZE = 4_000;
const CHUNK_OVERLAP = 400;
const MAX_EXTRACTED_CHARACTERS = 2_000_000;
const MAX_PDF_PAGES = 1_000;
const SUPPORTED_EXTENSIONS = new Set([
  '.csv',
  '.docx',
  '.json',
  '.markdown',
  '.md',
  '.pdf',
  '.txt',
]);

interface ExtractedPage {
  text: string;
  pageNumber: number | null;
}

export interface DocumentChunk {
  content: string;
  pageNumber: number | null;
}

export interface PreparedDocument {
  extractedText: string;
  chunks: DocumentChunk[];
}

@Injectable()
export class DocumentProcessor {
  async prepare(fileName: string, buffer: Buffer): Promise<PreparedDocument> {
    const extension = path.extname(fileName).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      throw new BadRequestException(
        'Unsupported document type. Use TXT, Markdown, CSV, JSON, PDF, or DOCX.',
      );
    }

    let pages: ExtractedPage[];
    try {
      if (extension === '.pdf') {
        pages = await this.extractPdf(buffer);
      } else if (extension === '.docx') {
        const result = await mammoth.extractRawText({ buffer });
        pages = [{ text: result.value, pageNumber: null }];
      } else {
        pages = [
          {
            text: new TextDecoder('utf-8', { fatal: true }).decode(buffer),
            pageNumber: null,
          },
        ];
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Could not extract readable text from the document.',
        { cause: error },
      );
    }

    const normalizedPages = pages
      .map((page) => ({
        ...page,
        text: this.normalizeText(page.text),
      }))
      .filter((page) => page.text.length > 0);
    const extractedText = normalizedPages.map((page) => page.text).join('\n\n');

    if (!extractedText) {
      throw new BadRequestException(
        'No readable text was found. Scanned PDFs require OCR and are not supported.',
      );
    }
    if (extractedText.length > MAX_EXTRACTED_CHARACTERS) {
      throw new BadRequestException(
        'The extracted document text exceeds the 2,000,000 character limit.',
      );
    }

    const chunks = normalizedPages.flatMap((page) =>
      this.chunkText(page.text, page.pageNumber),
    );

    return { extractedText, chunks };
  }

  private async extractPdf(buffer: Buffer): Promise<ExtractedPage[]> {
    const loadingTask = getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: true,
    });

    try {
      const document = await loadingTask.promise;
      if (document.numPages > MAX_PDF_PAGES) {
        throw new BadRequestException(
          `PDFs may contain at most ${MAX_PDF_PAGES} pages.`,
        );
      }

      const pages: ExtractedPage[] = [];
      let characterCount = 0;
      for (
        let pageNumber = 1;
        pageNumber <= document.numPages;
        pageNumber += 1
      ) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) =>
            'str' in item ? `${item.str}${item.hasEOL ? '\n' : ' '}` : '',
          )
          .join('');
        characterCount += text.length;
        if (characterCount > MAX_EXTRACTED_CHARACTERS) {
          throw new BadRequestException(
            'The extracted document text exceeds the 2,000,000 character limit.',
          );
        }
        pages.push({ text, pageNumber });
      }

      return pages;
    } finally {
      await loadingTask.destroy();
    }
  }

  private normalizeText(text: string): string {
    const textWithoutControls = Array.from(text)
      .filter((character) => {
        const code = character.charCodeAt(0);
        return (
          (code >= 0x20 || code === 0x09 || code === 0x0a || code === 0x0d) &&
          code !== 0x7f
        );
      })
      .join('');

    return textWithoutControls
      .normalize('NFC')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u00A0\u202F]/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private chunkText(text: string, pageNumber: number | null): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let start = 0;

    while (start < text.length) {
      let end = Math.min(start + CHUNK_SIZE, text.length);
      if (end < text.length) {
        const preferredBoundary = [
          text.lastIndexOf('\n\n', end),
          text.lastIndexOf('\n', end),
          text.lastIndexOf(' ', end),
        ].find((boundary) => boundary >= start + Math.floor(CHUNK_SIZE * 0.6));
        if (preferredBoundary !== undefined) {
          end = preferredBoundary;
        }

        const previousCodeUnit = text.charCodeAt(end - 1);
        const nextCodeUnit = text.charCodeAt(end);
        if (
          previousCodeUnit >= 0xd800 &&
          previousCodeUnit <= 0xdbff &&
          nextCodeUnit >= 0xdc00 &&
          nextCodeUnit <= 0xdfff
        ) {
          end += 1;
        }
      }

      const content = text.slice(start, end).trim();
      if (content) {
        chunks.push({ content, pageNumber });
      }
      if (end >= text.length) {
        break;
      }

      let nextStart = Math.max(start + 1, end - CHUNK_OVERLAP);
      while (nextStart < end && !/\s/u.test(text[nextStart])) {
        nextStart += 1;
      }
      while (nextStart < text.length && /\s/u.test(text[nextStart])) {
        nextStart += 1;
      }
      start = nextStart > start ? nextStart : end;
    }

    return chunks;
  }
}
