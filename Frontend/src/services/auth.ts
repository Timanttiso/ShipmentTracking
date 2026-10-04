import requestHelper from "./serviceHelper"

export interface AuthUser {
    id: number
    username: string
    email: string
}

export const checkAuth = (): Promise<AuthUser> => {
    return requestHelper<AuthUser>('/api/auth/me')
}

export const fetchLogin = <TResponse = unknown>(reqBody: Record<string, unknown>): Promise<TResponse> => {
    return requestHelper<TResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}

export const fetchRegister = <TResponse = unknown>(reqBody: Record<string, unknown>): Promise<TResponse> => {
    return requestHelper<TResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}