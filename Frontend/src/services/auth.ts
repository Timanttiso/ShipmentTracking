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

export const fetchLogin = async <TResponse = unknown>(reqBody: Record<string, unknown>): Promise<TResponse> => {
    return requestHelper<TResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}

export const fetchRegister = async <TResponse = unknown>(reqBody: Record<string, unknown>): Promise<TResponse> => {
    return requestHelper<TResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}