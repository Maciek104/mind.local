import { BadRequestException } from '@nestjs/common';
import { DocumentProcessor } from './document-processor.service.js';

describe('DocumentProcessor', () => {
  const processor = new DocumentProcessor();

  it('normalizes text and creates overlapping chunks within the configured size', async () => {
    const text = `  A heading  \r\n\r\n\r\n${'Useful context. '.repeat(500)}`;

    const result = await processor.prepare('notes.md', Buffer.from(text));

    expect(result.extractedText).toContain('A heading\n\nUseful context.');
    expect(result.chunks.length).toBeGreaterThan(1);
    expect(result.chunks.every((chunk) => chunk.content.length <= 4_001)).toBe(
      true,
    );
    expect(result.chunks.every((chunk) => chunk.pageNumber === null)).toBe(
      true,
    );
  });

  it('extracts PDF text and keeps its page number on the resulting chunks', async () => {
    const result = await processor.prepare('notes.pdf', createTextPdf());

    expect(result.extractedText).toContain('Hello LLM');
    expect(result.chunks[0].pageNumber).toBe(1);
  });

  it('rejects unsupported formats and documents without readable text', async () => {
    await expect(
      processor.prepare('image.png', Buffer.from('not an image')),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      processor.prepare('empty.txt', Buffer.from(' \r\n\t')),
    ).rejects.toThrow('No readable text was found');
  });
});

function createTextPdf(): Buffer {
  const textStream = 'BT /F1 18 Tf 20 80 Td (Hello LLM) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(textStream)} >>\nstream\n${textStream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const crossReferenceOffset = Buffer.byteLength(pdf);
  const crossReferenceEntries = offsets
    .map((offset, index) =>
      index === 0
        ? '0000000000 65535 f \n'
        : `${offset.toString().padStart(10, '0')} 00000 n \n`,
    )
    .join('');
  pdf += `xref\n0 ${offsets.length}\n${crossReferenceEntries}`;
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\n`;
  pdf += `startxref\n${crossReferenceOffset}\n%%EOF`;

  return Buffer.from(pdf);
}
