import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Use '/' for custom domain (eet-add.dtm.report)
      // Use '/EET/' if deploying to brianmcdonald.github.io/EET/
      base: '/',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:8000')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
