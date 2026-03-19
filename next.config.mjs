import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['pdf-parse', 'tesseract.js', 'pdf-to-img'],
  turbopack: {
    // Prevent Next from inferring the wrong workspace root when multiple lockfiles exist.
    root: here,
  },
};

export default nextConfig;
