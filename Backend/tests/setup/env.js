import { inject } from "vitest"

process.env.NODE_ENV = 'test'
process.env.DB_NAME = inject('dbName')
process.env.JWT_SECRET ??= 'test-secret'