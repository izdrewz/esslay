# Local PDF.js dependency

Source Mine uses a pinned local copy of PDF.js for browser-only text extraction from a PDF selected through the file picker.

- Package: `pdfjs-dist`
- Pinned version: `4.10.38`
- Runtime files: `pdf.mjs` and `pdf.worker.mjs`
- Installation: `.github/workflows/vendor-pdfjs.yml`
- Licence: Apache License 2.0, Mozilla Foundation

The PDF itself is never committed to this repository or uploaded by Esslay. The browser reads the selected file locally. PDF.js only extracts text already present in a PDF; scanned/image-only PDFs need OCR before they can become Source Mine cards.
