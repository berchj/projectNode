const express = require('express')
const app = express()
const port = 7100
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')
const pool = require('./lib/pool')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({resave:true,saveUninitialized:true,secret:'secret-token'}))
app.use(flash())
app.set('view engine','ejs')

app.use('/private/',(req,res,next)=>{
    if(!express.session.user){
        req.flash('messsaje','please login')
        res.redirect('/login')
    }
    next()
})

app.get('/register',(req,res)=>{
    res.render('register',{message:req.flash('message')})
})

app.post('/registred',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err) throw err
        console.log(req.body)
        const username = req.body.username.trim().toLowerCase()
        const email = req.body.email.toLowerCase()
        const password = req.body.password
        let q = `SELECT * FROM autores WHERE email = ${connection.escape(email)}`
        connection.query(q,(err,rows,fields)=>{
            if (err) throw err
            if(rows.length > 0){
                req.flash('message','that username has been taken')
                res.redirect('/register')
            }else{
                let q1 = `SELECT * FROM autores WHERE pseudonimo = ${connection.escape(username)}`
                connection.query(q1,(err,rows,fields)=>{
                    if(err) throw err
                    if(rows.length > 0){
                        req.flash('message','that email has an active account , please log in')
                        res.redirect('/register')
                    }else{
                        let q2 = `INSERT INTO 
                        autores (email,contrasena,pseudonimo) 
                       VALUES (
                        ${connection.escape(email)},
                        ${connection.escape(password)},
                        ${connection.escape(username)}
                               )`

                        connection.query(q2,(err,rows,fields)=>{
                            if(err) throw err
                            res.status(201)
                            req.flash('message','user created, log in please')
                            res.redirect('/register')
                        })
                    }
                })
            }

        })
        connection.release()
    })
})

app.get('/login',(req,res)=>{
    res.render('login',{message:req.flash('message')})
})

app.post('/loged',(req,res)=>{
    pool.getConnection((error,connection)=>{
        if (error) throw error
        let q = `SELECT * FROM autores WHERE email = ${connection.escape(req.body.email)} AND contrasena = ${connection.escape(req.body.password)}`
        connection.query(q,(err,rows,fields)=>{
            if(err) throw err
            if(!rows.length > 0){
                req.flash('message','user or email invalid')
                res.redirect('login')
            }else{
                res.status(200)
                req.session.user = rows[0]
                res.redirect('/private/private_index')
            }
        })
        connection.release()
    })
})

app.get('/private/private_index',(req,res)=>{
    res.render('private/private_index',{user:req.session.user})
})

app.get('/',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if (err) throw err
        let q = `SELECT publicaciones.id,pseudonimo,titulo,fecha_hora FROM publicaciones INNER JOIN autores ON publicaciones.autor_id = autores.id`
        connection.query(q,(err,rows,fields)=>{
            if (err) throw err            
            res.render('index',{data:rows})
            console.log(JSON.stringify(rows))
        })
        connection.release()
    })
})
app.listen(port,()=>{
    console.log(`server running on port ${port}`)    
})

