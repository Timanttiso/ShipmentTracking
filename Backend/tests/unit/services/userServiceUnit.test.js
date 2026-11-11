import { vi, test, expect, describe, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'

vi.doMock('../../../models/user.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            register: vi.fn(),
            findByName: vi.fn(),
            findByEmail: vi.fn(),
            findById: vi.fn(),
            updateUserSettings: vi.fn(),
            UpdatePassword: vi.fn(),
            RemoveUser: vi.fn()
        }
    }
})

vi.doMock('../../../models/destination.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            getById: vi.fn()
        }
    }
})

const User = (await import('../../../models/user.js')).default
const userService = (await import('../../../services/userService.js')).default
const Destination = (await import('../../../models/destination.js')).default

beforeEach(() => {
    vi.resetAllMocks()
})

describe('User service unit tests', () => {
    test('Register a user succesfully', async () => {
        const input = {
            username: 'UnitTestUser',
            password: 'testPassword1!',
            email: 'UnitTestUser@test.com'
        }

        const output = [{
            id: 1,
            username: 'UnitTestUser',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }]

        User.register.mockResolvedValue(output)

        const result = await userService.register(input)

        expect(result).toEqual(output)
    }),

    test('Check user credentials successfully with username', async () => {
        const input = {
            username: 'UnitTestUser',
            password: 'testPassword1!'
        }

        const output = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: await bcrypt.hash('testPassword1!', 4),
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }

        User.findByName.mockResolvedValue(output)

        const result = await userService.checkCredentials(input)

        expect(result).toEqual(output)
        expect(User.findByName).toHaveBeenCalledOnce()
        expect(User.findByEmail).not.toHaveBeenCalledOnce()
    }),

    test('Check user credentials succesfully with email', async () => {
        const input = {
            username: 'UnitTestUser',
            password: 'testPassword1!'
        }

        const output = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: await bcrypt.hash('testPassword1!', 4),
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }

        User.findByName.mockResolvedValue(null)
        User.findByEmail.mockResolvedValue(output)

        const result = await userService.checkCredentials(input)

        expect(result).toEqual(output)
        expect(User.findByName).toHaveBeenCalledOnce()
        expect(User.findByEmail).toHaveBeenCalledOnce()
    }),

    test('Get user by id', async () => {
        const output = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: 'testPassword1!',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }

        User.findById.mockResolvedValue(output)

        const result = await userService.getById(1)

        expect(result).toEqual(output)
        expect(User.findById).toHaveBeenCalledOnce()
    }),

    test('Update user settings with only the username', async () => {
        const input = {
            username: 'UnitTestUserEdited',
            email: null,
            default_destination_id: null
        }

        const output1 = {
            id: 1,
            username: 'UnitTestUserEdited',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }
        const output2 = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: 'testPassword1!',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }

        User.findById.mockResolvedValue(output2)
        User.findByName.mockResolvedValue(null)
        User.updateUserSettings.mockResolvedValue(output1)

        const result = await userService.UpdateUserSettings(1, input)

        expect(result).toEqual(output1)
        expect(User.findById).toHaveBeenCalledOnce()
        expect(User.findByName).toHaveBeenCalledOnce()
        expect(User.findByEmail).not.toHaveBeenCalledOnce()
        expect(Destination.getById).not.toHaveBeenCalledOnce()
    }),

    test('Update user settings with only the email', async () => {
        const input = {
            username: null,
            email: 'UnitTestUserEdited@test.com',
            default_destination_id: null
        }

        const output1 = {
            id: 1,
            username: 'UnitTestUser',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }
        const output2 = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: 'testPassword1!',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }

        User.findById.mockResolvedValue(output2)
        User.findByEmail.mockResolvedValue(null)
        User.updateUserSettings.mockResolvedValue(output1)

        const result = await userService.UpdateUserSettings(1, input)

        expect(result).toEqual(output1)
        expect(User.findById).toHaveBeenCalledOnce()
        expect(User.findByName).not.toHaveBeenCalledOnce()
        expect(User.findByEmail).toHaveBeenCalledOnce()
        expect(Destination.getById).not.toHaveBeenCalledOnce()
    }),

    test('Update user settings with only the default_destination_id', async () => {
        const input = {
            username: null,
            email: null,
            default_destination_id: 1
        }

        const output1 = {
            id: 1,
            username: 'UnitTestUser',
            email: 'UnitTestUser@test.com',
            default_destination_id: 1
        }
        const output2 = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: 'testPassword1!',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }
        const destinationOutput = {
            id: 1,
            destination_name: 'UnitTestDestination',
            lon: 0.00,
            lat: 0.00,
            user_id: 1
        }

        User.findById.mockResolvedValue(output2)
        Destination.getById.mockResolvedValue(destinationOutput)
        User.updateUserSettings.mockResolvedValue(output1)

        const result = await userService.UpdateUserSettings(1, input)

        expect(result).toEqual(output1)
        expect(User.findById).toHaveBeenCalledOnce()
        expect(User.findByName).not.toHaveBeenCalledOnce()
        expect(User.findByEmail).not.toHaveBeenCalledOnce()
        expect(Destination.getById).toHaveBeenCalledOnce()
    }),

    test('Update user settings with all settings filled out', async () => {
        const input = {
            username: 'UnitTestUserEdited',
            email: 'UnitTestUserEdited@test.com',
            default_destination_id: 1
        }

        const output1 = {
            id: 1,
            username: 'UnitTestUserEdited',
            email: 'UnitTestUserEdited@test.com',
            default_destination_id: 1
        }
        const output2 = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: 'testPassword1!',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }
        const destinationOutput = {
            id: 1,
            destination_name: 'UnitTestDestination',
            lon: 0.00,
            lat: 0.00,
            user_id: 1
        }

        User.findById.mockResolvedValue(output2)
        User.findByEmail.mockResolvedValue(null)
        User.findByName.mockResolvedValue(null)
        Destination.getById.mockResolvedValue(destinationOutput)
        User.updateUserSettings.mockResolvedValue(output1)

        const result = await userService.UpdateUserSettings(1, input)

        expect(result).toEqual(output1)
        expect(User.findById).toHaveBeenCalledOnce()
        expect(User.findByName).toHaveBeenCalledOnce()
        expect(User.findByEmail).toHaveBeenCalledOnce()
        expect(Destination.getById).toHaveBeenCalledOnce()
    }),

    test('Change password', async () => {
        const input = {
            old_password: 'testPassword1!',
            new_password: 'testPassword2!'
        }

        const user = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: await bcrypt.hash('testPassword1!', 4),
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }

        const output = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: await bcrypt.hash('testPassword2!', 4),
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }

        User.findById.mockResolvedValue(user)
        User.UpdatePassword.mockResolvedValue(output)

        const result = await userService.ChangePassword(1, input)

        expect(result).toEqual(output)
        expect(User.findById).toHaveBeenCalledOnce()
        expect(User.UpdatePassword).toHaveBeenCalledOnce()
    }),

    test('Delete user', async () => {
        const user = {
            id: 1,
            username: 'UnitTestUser',
            password_hash: 'testPassword1!',
            email: 'UnitTestUser@test.com',
            default_destination_id: null
        }

        User.findById.mockResolvedValue(user)
        User.RemoveUser.mockResolvedValue(1)

        const result = await userService.DeleteUser(1)

        expect(result).toBe(1)
        expect(User.findById).toHaveBeenCalledOnce()
        expect(User.RemoveUser).toHaveBeenCalledOnce()
    })
})