import { vi, test, expect, describe, beforeEach } from 'vitest'

vi.doMock('../../../models/destination.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            add: vi.fn(),
            getByName: vi.fn(),
            getAllForUser: vi.fn(),
            getById: vi.fn(),
            updateDestination: vi.fn(),
            deleteDestination: vi.fn()
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
            id: 1,
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
    }),

    test('Get all destinations for user', async() => {
        const output = [
        {
            id: 1,
            destination_name: 'UnitTestDestination',
            lon: '20.0',
            lat: '30.0',
            user_id: 7
        },
        {
            id: 3,
            destination_name: 'UnitTestDestination2',
            lon: '20.0',
            lat: '30.0',
            user_id: 7
        }
        ]

        Destination.getAllForUser.mockResolvedValue(output)

        const result = await destinationService.GetAllForUser(7)

        expect(result).toEqual(output)

        expect(Destination.getAllForUser).toHaveBeenCalledOnce()
        expect(Destination.getAllForUser).toHaveBeenCalledWith(7)
    }),

    test('Get a destination by id', async() => {
        const output = 
        {
            id: 3,
            destination_name: 'UnitTestDestination',
            lon: '20.0',
            lat: '30.0',
            user_id: 7
        }

        Destination.getById.mockResolvedValue(output)

        const result = await destinationService.GetById(3, 7)

        expect(result).toEqual(output)

        expect(Destination.getById).toHaveBeenCalledOnce()
        expect(Destination.getById).toHaveBeenCalledWith(3, 7)
    }),

    test('Get default destination', async() => {
        const output = 
        {
            id: 3,
            destination_name: 'UnitTestDestination',
            lon: '20.0',
            lat: '30.0',
            user_id: 7
        }

        Destination.getById.mockResolvedValue(output)

        const result = await destinationService.GetDefault(3, 7)

        expect(result).toEqual(output)

        expect(Destination.getById).toHaveBeenCalledOnce()
        expect(Destination.getById).toHaveBeenCalledWith(3, 7)
    }),

    test('Update destination', async() => {
        const output1 = 
        {
            id: 3,
            destination_name: 'UnitTestDestination',
            lon: '20.0',
            lat: '30.0',
            user_id: 7
        }
        const output2 = 
        {
            id: 3,
            destination_name: 'UnitTestDestinationEdited',
            lon: '20.0',
            lat: '30.0',
            user_id: 7
        }

        Destination.getById.mockResolvedValue(output1)
        Destination.updateDestination.mockResolvedValue(output2)

        const result = await destinationService.UpdateDestinationInfo(3, 7, { destination_name: 'UnitTestDestinationEdited', lon: 20.0, lat: 30.0 })

        expect(result).toEqual(output2)

        expect(Destination.getById).toHaveBeenCalledOnce()
        expect(Destination.getById).toHaveBeenCalledWith(3, 7)

        expect(Destination.updateDestination).toHaveBeenCalledOnce()
        expect(Destination.updateDestination).toHaveBeenCalledWith(3, { destination_name: 'UnitTestDestinationEdited', lon: 20.0, lat: 30.0 })
    }),

    test('Delete a destionation', async() => {
        const output = 
        {
            id: 3,
            destination_name: 'UnitTestDestination',
            lon: '20.0',
            lat: '30.0',
            user_id: 7
        }

        Destination.getById.mockResolvedValue(output)
        Destination.deleteDestination.mockResolvedValue(null)

        await destinationService.DeleteDestination(3, 7)
        
        expect(Destination.getById).toHaveBeenCalledOnce()
        expect(Destination.getById).toHaveBeenCalledWith(3, 7)

        expect(Destination.deleteDestination).toHaveBeenCalledOnce()
        expect(Destination.deleteDestination).toHaveBeenCalledWith(3)
    })
})