// Logger for printing server side messages to console or writing error logs to file at a later point.

const info = (...params) => {
    console.info('(i)', ...params)
}

const error = (...params) => {
    console.error('(e)', ...params)
}

export default { info, error }