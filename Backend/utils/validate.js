export const validate = (schema) => (request, response, next) => {
    const result = schema.safeParse(request.body)
    if(!result.success) {
        return response.status(400).json({
            error: result.error.issues[0].message,
        })
    }
    request.body = result.data
    next()
}