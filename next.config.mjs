import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {
    // Prevent Next from inferring the wrong workspace root when multiple lockfiles exist.
    root: here,
  },
};

export default nextConfig;
