import logger from './logger.js';
import ApiError from './ApiError.js';

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (err, req, res, next) => {
    /*
    // How to use this errorHandler with the ApiError class

    import ApiError from '../utils/ApiError.js'

    if (problem) {
        throw new ApiError('Message to show developers', HTTP status, 'Message to send to the client')
    }
    */
    
    if (err instanceof ApiError && err.status && err.status !== 500) {
        // For errors thrown with ApiError
        if (process.env.NODE_ENV !== 'production') logger.error(err.message)

        return res.status(err.status).json({ error: err.userDetails })
    } else if (err.status && err.status !== 500) {
        // In case the normal Error class is used instead of the ApiError class
        if (process.env.NODE_ENV !== 'production') logger.error(err.message)
        
        return res.status(err.status).json({ error: err.userDetails || err.message })
    }

    // For unhandled errors
    // Prints the actual error stack to backend console/terminal for developers to see
    // As a future enhancment, this could also log unhandled errors to some log file.
    logger.error(err)
    // returns error status 500 and error message 'Internal server error' to client
    return res.status(500).json({ error: 'Internal Server Error' })
}

export default {
    unknownEndpoint,
    errorHandler
}