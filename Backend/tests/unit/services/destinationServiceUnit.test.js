import { vi, test, expect, describe, beforeEach } from 'vitest'

vi.doMock('../../../models/destination.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            add: vi.fn(),
            getByName: vi.fn()
        }
    }
})

const Destination = (await import('../../../models/destination.js')).default
const destinationService = (await import('../../../services/destinationService.js')).default

beforeEach(() => {
    vi.resetAllMocks()
})

describe('Destination service unit tests', () => {
    test('Add a destination', async() => {
        const input = {
            destination_name: 'UnitTestDestination',
            lon: 20.0,
            lat: 30.0
        }

        const output = {
            destination_name: 'UnitTestDestination',
            lon: '20.0',
            lat: '30.0',
            user_id: 7
        }

        Destination.getByName.mockResolvedValue(null)
        Destination.add.mockResolvedValue(output)

        const result = await destinationService.AddDestination(input, 7)

        expect(result).toEqual(output)

        expect(Destination.getByName).toHaveBeenCalledOnce()
        expect(Destination.getByName).toHaveBeenCalledWith(7, input.destination_name)

        expect(Destination.add).toHaveBeenCalledOnce()
        expect(Destination.add).toHaveBeenCalledWith(input, 7)
    })
})