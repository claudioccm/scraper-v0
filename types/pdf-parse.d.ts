declare module 'pdf-parse' {
  interface PDFMetadata {
    has(name: string): boolean
    get(name: string): string | undefined
  }

  interface PDFInfo {
    [key: string]: string | number | undefined
    Title?: string
    Author?: string
    CreationDate?: string
    ModDate?: string
  }

  export interface PDFParseResult {
    text: string
    info?: PDFInfo
    metadata?: PDFMetadata | null
    numpages?: number
    version?: string
  }

  export interface PDFParseOptions {
    max?: number
    version?: string
    pagerender?(pageData: any): string
  }

  function pdfParse(data: Buffer | Uint8Array, options?: PDFParseOptions): Promise<PDFParseResult>

  export default pdfParse
}

declare module 'pdf-parse/lib/pdf-parse.js' {
  import pdfParse from 'pdf-parse'
  export * from 'pdf-parse'
  export default pdfParse
}
