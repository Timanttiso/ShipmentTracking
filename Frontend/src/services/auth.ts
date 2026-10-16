import requestHelper from './serviceHelper'

export interface AuthUser {
    id: number
    username: string
    email: string
    default_destination_id: number
    default_destination_name: string
}

interface LoginResponse {
    token: string
}

export const fetchRegister = (reqBody: Record<string, unknown>): Promise<UserResponse> => {
    return requestHelper<UserResponse>('/api/auth/register', false, {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}

export const checkAuth = (): Promise<AuthUser> => {
    return requestHelper<AuthUser>('/api/auth/me', false)
}

export const fetchLogin = (reqBody: Record<string, unknown>): Promise<LoginResponse> => {
    return requestHelper<LoginResponse>('/api/auth/login', false, {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}

export const fetchLogout = (): Promise<void> => {
    return requestHelper<void>('/api/auth/logout', true, {
        method: 'POST',
    })
}

type SettingsRequest = {
    username?: string,
    email?: string,
    default_destination_id?: number
}

type UserResponse = [{
    id: number,
    username: string,
    password_hash: string,
    email: string
    default_destination_id: number | null
}]

export const updateSettings = (reqBody: SettingsRequest): Promise<UserResponse> => {
    return requestHelper<UserResponse>('/api/auth/settings', true, {
        method: 'PATCH',
        body: JSON.stringify(reqBody),
    })
}

export const changePassword = (old_password: string, new_password: string): Promise<void> => {
    return requestHelper<void>('/api/auth/settings/change-password', true, {
        method: 'PATCH',
        body: JSON.stringify({ old_password, new_password }),
    })
}

export const deleteAccount = (): Promise<void> => {
    return requestHelper<void>('/api/auth/settings/delete-account', true, {
        method: 'DELETE',
    })
}