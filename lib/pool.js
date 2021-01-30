const mysql = require('mysql2')
const pool = mysql.createPool({
    host: 'localhost',
    user: 'berchj',
    password: 'Asharot13!',
    database: 'blog_viajes',
    connectTimeout: 10,
    
})
module.exports = pool