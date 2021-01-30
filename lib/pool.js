const mysql = require('mysql2')
const pool = mysql.createPool({
    host: 'localhost',
    user: '',
    password: '',
    database: 'blog_viajes',
    connectTimeout: 10,
    
})
module.exports = pool 