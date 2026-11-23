import { vi, test, expect, describe, beforeEach } from 'vitest'
import { hashToken } from '../../../utils/tokens.js'

vi.doMock('../../../models/refreshToken.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            add: vi.fn(),
            findByHash: vi.fn(),
            deleteByHash: vi.fn()
        }
    }
})

const RefreshToken = (await import('../../../models/refreshToken.js')).default
const RefreshTokenService = (await import('../../../services/refreshTokenService.js')).default

beforeEach(() => {
    vi.resetAllMocks()
})

describe('Refresh token service unit tests', () => {
    test('Add a refresh token', async () => {
        const input = {
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b624d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: 8
        }

        const output = {
            id: 1,
            token_hash: input.token_hash,
            expires_at: input.expires_at,
            user_id: 8
        }

        RefreshToken.add.mockResolvedValue(output)

        const result = await RefreshTokenService.create(input)

        expect(result).toEqual(output)

        expect(RefreshToken.add).toHaveBeenCalledOnce()
        expect(RefreshToken.add).toHaveBeenCalledWith(input)
    }),

    test('Find refresh token by hash', async () => {
        const output = {
            id: 1,
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b624d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: 8
        }

        RefreshToken.findByHash.mockResolvedValue(output)

        const result = await RefreshTokenService.findByHash(output.token_hash)

        expect(result).toEqual(output)

        expect(RefreshToken.findByHash).toHaveBeenCalledOnce()
        expect(RefreshToken.findByHash).toHaveBeenCalledWith(output.token_hash)
    }),

    test('Delete by hash', async () => {
        const foundHash = {
            id: 1,
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b624d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: 8
        }

        RefreshToken.findByHash.mockResolvedValue(foundHash)

        await RefreshTokenService.deleteByHash(foundHash.token_hash)

        expect(RefreshToken.findByHash).toHaveBeenCalledOnce()
        expect(RefreshToken.findByHash).toHaveBeenCalledWith(foundHash.token_hash)

        expect(RefreshToken.deleteByHash).toHaveBeenCalledOnce()
        expect(RefreshToken.deleteByHash).toHaveBeenCalledWith(foundHash.token_hash)
    })
})