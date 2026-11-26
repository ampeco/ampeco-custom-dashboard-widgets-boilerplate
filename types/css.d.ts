// TypeScript 6 checks side-effect imports, so a plain stylesheet import such as
// `import "./globals.css"` in app/layout.tsx fails with TS2882 unless the module
// is declared. Next.js declares "*.module.css" itself (CSS Modules keep their
// own typing), but not a stylesheet that is imported only for its effect.
declare module "*.css";
