/**
 * To throw an error with this class:
 * throw new ApiError('developer-side message', HTTP status, 'client-side message')
 */
class ApiError extends Error {
    constructor(message, status = 500, userDetails) {
        super(message)
        this.status = status
        this.userDetails = userDetails
    }
}

export default ApiError
