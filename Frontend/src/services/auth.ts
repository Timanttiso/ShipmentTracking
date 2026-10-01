class ApiError extends Error {
    status: number

    constructor(status: number, message?: string) {
        super(message ?? 'Connection error')
        this.status = status
    }
}

interface ErrorResponse {
    error?: string
    message?: string
}

const isErrorResponse = (value: unknown): value is ErrorResponse =>
    typeof value === 'object' && value !== null && ('error' in value || 'message' in value)

const requestHelper = async <TResponse = unknown>(path: string, options: RequestInit = {}): Promise<TResponse> => {
    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')

    const token = localStorage.getItem('shipmentTrackingAuthToken')
    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const res = await fetch(path, {
        ...options,
        headers,
    })

    if (!res.ok) {
        const body: unknown = await res.json()

        const msg = isErrorResponse(body)
            ? body.error ?? body.message ?? res.statusText
            : res.statusText

        throw new ApiError(res.status, msg)
    }

    return (await res.json()) as TResponse
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

export interface AuthUser {
    id: number
    username: string
    email: string
}

export const checkAuth = (): Promise<AuthUser> => {
    return requestHelper<AuthUser>('/api/auth/me')
}