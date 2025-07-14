import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the root directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Expose env variables to your app
    define: {
      'process.env': env
    }
  };
});