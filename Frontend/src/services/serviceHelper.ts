export const authExpiredEvent = 'shipmentTracking:auth-expired'

export class ApiError extends Error {
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

const requestHelper = async <TResponse = unknown>(path: string, authRequired: boolean, options: RequestInit = {}): Promise<TResponse> => {
    const token = localStorage.getItem('shipmentTrackingAuthToken')
    if (authRequired && !token) {
        window.dispatchEvent(new Event(authExpiredEvent))
        throw new ApiError(401, 'Authentication required')
    }

    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const res = await fetch(path, {
        ...options,
        headers,
    })

    if (!res.ok) {
        if (authRequired && res.status === 401) {
            window.dispatchEvent(new Event(authExpiredEvent))
        }

        const body: unknown = await res.json()

        const msg = isErrorResponse(body)
            ? body.error ?? body.message ?? res.statusText
            : res.statusText

        throw new ApiError(res.status, msg)
    }

    return (await res.json()) as TResponse
}

export default requestHelper