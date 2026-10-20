import { rateLimit, ipKeyGenerator } from 'express-rate-limit'

export const loginLimiter = rateLimit({
    windowMs: 15*60*1000,   //15 mins
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (request) => `${ipKeyGenerator(request.ip)}:${String(request.body?.username ?? '').toLowerCase()}`,
    message: { error: 'Liian monta kirjautumisyritystä. Yritä myöhemmin uudelleen.' }
})