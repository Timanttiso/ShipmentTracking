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