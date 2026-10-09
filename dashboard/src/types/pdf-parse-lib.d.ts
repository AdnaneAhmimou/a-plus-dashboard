/* eslint-disable @typescript-eslint/no-require-imports -- `import X = require(...)` is the
   correct TS syntax for re-exporting an `export =` module from a .d.ts file. */
// pdf-parse's package entry (index.js) runs a debug block at import time
// when `module.parent` is falsy — which Next.js's build-time page-data
// collection triggers, crashing the build with an ENOENT for a test
// fixture file. Importing the inner implementation file directly (as
// src/lib/ai/extract-analysis.ts does) skips that debug block entirely.
// This file just gives that subpath import the same types as the
// package's own root-level declaration.
declare module "pdf-parse/lib/pdf-parse.js" {
  import PdfParse = require("pdf-parse");
  export = PdfParse;
}
