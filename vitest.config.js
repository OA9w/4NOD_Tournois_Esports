import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false, // Run test files sequentially for DB isolation
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules',
        'prisma',
        'src/generated',
        'src/views',
        'src/public',
        'tests',
      ],
    },
    env: {
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'test-secret-key-minimum-32-characters-long',
      JWT_EXPIRES_IN: '1h',
      NODE_ENV: 'test',
      PORT: '3001',
    },
  },
})
