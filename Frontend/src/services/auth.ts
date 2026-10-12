import requestHelper from './serviceHelper'

export interface AuthUser {
    id: number
    username: string
    email: string
    default_destination_id: number
}

export const checkAuth = (): Promise<AuthUser> => {
    return requestHelper<AuthUser>('/api/auth/me', false)
}

export const fetchLogin = <TResponse = unknown>(reqBody: Record<string, unknown>): Promise<TResponse> => {
    return requestHelper<TResponse>('/api/auth/login', false, {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}

export const fetchRegister = <TResponse = unknown>(reqBody: Record<string, unknown>): Promise<TResponse> => {
    return requestHelper<TResponse>('/api/auth/register', false, {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}

type SettingsRequest = {
    username?: string,
    email?: string,
    default_destination_id?: number
}

type SettingsResponse = [{
    id: number,
    username: string,
    password_hash: string,
    email: string
    default_destination_id: number
}]

export const updateSettings = (reqBody: SettingsRequest): Promise<SettingsResponse> => {
    return requestHelper<SettingsResponse>('/api/auth/settings', true, {
        method: 'PATCH',
        body: JSON.stringify(reqBody),
    })
}

export const changePassword = <TResponse = unknown>(old_password: string, new_password: string): Promise<TResponse> => {
    return requestHelper<TResponse>('/api/auth/settings/change-password', true, {
        method: 'PATCH',
        body: JSON.stringify({ old_password, new_password }),
    })
}

export const deleteAccount = (): Promise<void> => {
    return requestHelper<void>('/api/auth/settings/delete-account', true, {
        method: 'DELETE',
    })
}