import { vi, test, expect, describe, beforeEach } from 'vitest'

vi.doMock('../../../mqtt/mqtt.index.js', () => ({
    requestSubscriptionReload: vi.fn()
}))

vi.doMock('../../../models/ship.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            Add: vi.fn(),
            GetByMMSI: vi.fn(),
            GetById: vi.fn()
        }
    }
})

vi.doMock('../../../models/user_ship.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            Add: vi.fn(),
            GetUserShipByShipId: vi.fn(),
            GetUserShips: vi.fn(),
            UpdateShipNickname: vi.fn(),
            UpdateConnection: vi.fn()
        }
    }
})

const Ship = (await import('../../../models/ship.js')).default
const User_Ship = (await import('../../../models/user_ship.js')).default
const ShipService = (await import('../../../services/shipService.js')).default
const { requestSubscriptionReload } = await import('../../../mqtt/mqtt.index.js')

beforeEach(() => {
    vi.resetAllMocks()
})

describe('Ship service unit tests', () => {
    test('Add ship that does not exist', async () => {
        const addedShip = {
            id: 1,
            ship_name: null,
            mmsi: '305665000',
            lon: null,
            lat: null,
            updated_at: null
        }
        const added_ship_link = [{
            user_ship_id: 1,
            user_id: 8,
            ship_id: 1,
            ship_nickname: 'UnitTestShip'
        }]
        const output = {
            id: 1,
            ship_name: null,
            mmsi: '305665000',
            lon: null,
            lat: null,
            updated_at: null,
            ship_nickname: 'UnitTestShip'
        }
        Ship.GetByMMSI.mockResolvedValue(null)
        Ship.Add.mockResolvedValue(addedShip)
        User_Ship.GetUserShipByShipId
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(output)
        User_Ship.Add.mockResolvedValue(added_ship_link)

        const result = await ShipService.AddShip(8, 'UnitTestShip', '305665000')

        expect(result).toEqual(output)

        expect(Ship.GetByMMSI).toHaveBeenCalledOnce()
        expect(Ship.GetByMMSI).toHaveBeenCalledWith('305665000')

        expect(Ship.Add).toHaveBeenCalledOnce()
        expect(Ship.Add).toHaveBeenCalledWith('305665000')

        expect(requestSubscriptionReload).toHaveBeenCalledOnce()

        expect(User_Ship.Add).toHaveBeenCalledOnce()
        expect(User_Ship.Add).toHaveBeenCalledWith(8, 1, 'UnitTestShip')

        expect(User_Ship.GetUserShipByShipId).toHaveBeenCalledTimes(2)
    }),

    test('Add an already existing ship', async () => {
        const existingShip = {
            id: 1,
            ship_name: null,
            mmsi: '305665000',
            lon: null,
            lat: null,
            updated_at: null
        }
        const added_ship_link = [{
            user_ship_id: 1,
            user_id: 8,
            ship_id: 1,
            ship_nickname: 'UnitTestShip'
        }]
        const output = {
            id: 1,
            ship_name: null,
            mmsi: '305665000',
            lon: null,
            lat: null,
            updated_at: null,
            ship_nickname: 'UnitTestShip'
        }

        Ship.GetByMMSI.mockResolvedValue(existingShip)
        User_Ship.GetUserShipByShipId
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(output)
        User_Ship.Add.mockResolvedValue(added_ship_link)

        const result = await ShipService.AddShip(8, 'UnitTestShip', '305665000')

        expect(result).toEqual(output)

        expect(Ship.GetByMMSI).toHaveBeenCalledOnce()
        expect(Ship.GetByMMSI).toHaveBeenCalledWith('305665000')

        expect(Ship.Add).not.toHaveBeenCalledOnce()
        expect(requestSubscriptionReload).not.toHaveBeenCalledOnce()

        expect(User_Ship.Add).toHaveBeenCalledOnce()
        expect(User_Ship.Add).toHaveBeenCalledWith(8, 1, 'UnitTestShip')

        expect(User_Ship.GetUserShipByShipId).toHaveBeenCalledTimes(2)
    }),

    test('Get ships all for user', async () => {
        const output = [
            {
                id: 1,
                ship_name: null,
                mmsi: '305665000',
                lon: null,
                lat: null,
                updated_at: null,
                ship_nickname: 'UnitTestShip1'
            },
            {
                id: 2,
                ship_name: null,
                mmsi: '230981710',
                lon: null,
                lat: null,
                updated_at: null,
                ship_nickname: 'UnitTestShip2'
            }
        ]

        User_Ship.GetUserShips.mockResolvedValue(output)

        const result = await ShipService.GetAllUserShips(8)

        expect(result).toEqual(output)
        expect(User_Ship.GetUserShips).toHaveBeenCalledOnce()
        expect(User_Ship.GetUserShips).toHaveBeenCalledWith(8)
    }),

    test('Get a specific ship', async () => {
        const output = {
            id: 2,
            ship_name: null,
            mmsi: '230981710',
            lon: null,
            lat: null,
            updated_at: null,
            ship_nickname: 'UnitTestShip2'
        }

        User_Ship.GetUserShipByShipId.mockResolvedValue(output)

        const result = await ShipService.GetSpecificShip(8, 2)

        expect(result).toEqual(output)

        expect(User_Ship.GetUserShipByShipId).toHaveBeenCalledOnce()
        expect(User_Ship.GetUserShipByShipId).toHaveBeenCalledWith(8, 2)
    }),

    test('Update ship nickname', async () => {
        const input = {
            ship_nickname: 'UnitTestShip2Edited',
            mmsi: null
        }

        const output = {
            id: 2,
            ship_name: null,
            mmsi: '230981710',
            lon: null,
            lat: null,
            updated_at: null,
            ship_nickname: 'UnitTestShip2Edited'
        }

        const existingShip = {
            id: 2,
            ship_name: null,
            mmsi: '230981710',
            lon: null,
            lat: null,
            updated_at: null
        }

        const existingFullShip = {
            id: 2,
            ship_name: null,
            mmsi: '230981710',
            lon: null,
            lat: null,
            updated_at: null,
            ship_nickname: 'UnitTestShip2'
        }

        Ship.GetById.mockResolvedValue(existingShip)
        User_Ship.GetUserShipByShipId
            .mockResolvedValueOnce(existingFullShip)
            .mockResolvedValueOnce(output)

        const result = await ShipService.UpdateShip(8, 2, input)

        expect(result).toEqual(output)

        expect(Ship.GetById).toHaveBeenCalledOnce()
        expect(Ship.GetById).toHaveBeenCalledWith(2)

        expect(User_Ship.GetUserShipByShipId).toHaveBeenCalledTimes(2)

        expect(User_Ship.UpdateShipNickname).toHaveBeenCalledOnce()
        expect(User_Ship.UpdateShipNickname).toHaveBeenCalledWith(8, 2, input.ship_nickname)

        expect(requestSubscriptionReload).not.toHaveBeenCalledOnce()
        expect(User_Ship.UpdateConnection).not.toHaveBeenCalledOnce()
    })
})