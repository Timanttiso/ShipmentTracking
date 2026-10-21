import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        projects: [
            {
                test:{
                    name: 'unit',
                    environment: 'node',
                    include: ['tests/unit/**/*.test.js'],
                    globalSetup: ['./tests/setup/globalSetup.unit.js'],
                    setupFiles: ['./tests/setup/env.js']
                }
            },
            {
                test:{
                    name: 'integration',
                    environment: 'node',
                    include: ['tests/integration/**/*.test.js'],
                    globalSetup: ['./tests/setup/globalSetup.integration.js'],
                    setupFiles: ['./tests/setup/env.js'],
                    fileParallelism: false
                }
            }
        ]
    }
})