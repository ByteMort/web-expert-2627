import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        coverage: {
            provider: 'v8',
            include: ['controllers/**', 'services/**', 'middlewares/**', 'routes/**'],
            reporter: ['text', 'html']
        },
        setupFiles: ['./tests/setup.ts']
    }
});