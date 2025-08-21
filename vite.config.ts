import { defineConfig } from 'vite';

export default defineConfig({
    root: './src/',
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: {
                sidebar: './src/sidebar.html',
                devtools: './src/devtools.html',
                background: './src/background.ts',
            },
            output: {
                entryFileNames: '[name].js',
                assetFileNames: '[name][extname]',
            },
        },
        emptyOutDir: true,
    },
});
