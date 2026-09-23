import config from './utils/config.js'
import app from './app.js'

app.listen(config.PORT, () => {
    console.log("API running on http://localhost:3001")
})