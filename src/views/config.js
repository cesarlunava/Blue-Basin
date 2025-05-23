const PORT = process.env.PORT || 4000;

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || 'cesar100'
const DB_NAME = process.env.DB_NAME || 'app_clickcrop'
const DB_PORT = process.env.DB_PORT || 3308

module.exports = {PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT};