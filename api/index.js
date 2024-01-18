const express = require("express");
const app = express();
const dotenv = require('dotenv').config()
const mongoose = require('mongoose');
const user = require('./model/users')
const Messages = require('./model/message')
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws  = require('ws');



mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JSON_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);


//cors package use to handle CORS error
app.use(cors({
    credentials: true,
    origin: "http://192.168.0.113:5173",
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));



app.use(function(req, res, next) {
    res.header('Content-Type', 'application/json;charset=UTF-8')
    res.header('Access-Control-Allow-Credentials', true)
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
  })

  app.use(express.json())
  app.use(cookieParser())

app.get('/test', (req, res) => {
    res.json('test ok');
})

app.get('/profile',(req,res)=>{
    // console.log(req.cookies);
   const token  = req.cookies?.token;
   if(token){
    jwt.verify(token,jwtSecret,{},(err,result)=>{
        if(err) throw err
        // const {id,username} = result
        res.json(
            result
        );
    })
   }else{
    res.status(401).json('No Token Found')
   }
   
})

app.post('/login',async (req,res)=>{
    const {username,password} = req.body;
    const founduser = await user.findOne({username})

    if(founduser){
      const passOK =   bcrypt.compareSync(password,founduser.password);
      if(passOK){
        jwt.sign({userId:founduser.id,username},jwtSecret,{},(err,token)=>{
            res.cookie('token',token,{SameSite:'None',secure:false}).status(201).json({
                id:founduser.id,
                username:founduser.username
            })
        })
      }
    }
})

app.post('/register', async (req, res) => {
    try{
        const { username, password } = req.body;
        const hashedPassword= bcrypt.hashSync(password,bcryptSalt);
        //to get req.body ,you mut use express.json() using app.use()
        const createdUSer = await user.create({ 'username':username, 'password':hashedPassword });
        jwt.sign({ userId: createdUSer.id ,username}, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token',token,{SameSite:'None',secure:false}).status(201).json({
                id:createdUSer.id,
                username:createdUSer.username
            });
        })
    }
    catch(err){
        if(err) throw err
        res.status(500).json('error')
        
    }
        

})

const server = app.listen('3000');
const wsServer = new ws.WebSocketServer({server});

function isOpen(ws) {
     return ws.readyState === ws.OPEN 
}

if(isOpen(wsServer)){
    wsServer.on('connection',(connection,req)=>{

        //read username and cookie on connection
        const cookie= req.headers.cookie;
        if(cookie){
            const tokenCookingString = cookie.split(';').find(str=>str.startsWith('token='))
            if(tokenCookingString)
            {
                const token = tokenCookingString.split('=')[1];
                if(token){
                    jwt.verify(token,jwtSecret,{},(err,userData)=>{
                        if(err) throw err;
                        const {userId,username} = userData;
                        connection.userId = userId;
                        connection.userName = username;
                    })
                }
            }
            
        }
        
    
        [...wsServer.clients].forEach((client)=>{
            
            client.send(JSON.stringify({
    
                onLine:[...wsServer.clients].map((name)=>({"id":name.userId ,"userName" : name.userName}))
    
            }))
        })

        connection.on('message' , async function(message) {
            const msgDAta = JSON.parse(message);
            const {recipient,text} = msgDAta.message;
            if(recipient && text){
               const msgDoc =  await Messages.create({
                    sender:connection.userId,
                    recipient,
                    text
                });

                [...wsServer.clients].filter(c=>c.userId===recipient)
                .forEach(usr=>{
                    usr.send(JSON.stringify({text,
                        sender:connection.userId,
                        id:msgDoc._id
                    }))
                })
            }
        });
        
        // ws.send('hello from the server!');

        // ws.on('message',(msg)=>{
        //     console.log(msg,'thid is message');
        // })
    
    
    })
    
    // wsServer.on('message',(msg)=>{
    //     console.log(msg,'thid is message');
    // })
    
}

// nikhilmourya65
// 7AA9cQuJqUYk8faT