const express = require("express");
const { createServer } = require("http"); 
const { Server } = require("socket.io"); 
const Redis = require('ioredis');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express(); 

const httpServer = createServer(app); // http server using express app
const redisCache = new Redis({
    host: process.env.REDIS_HOST,  
    port: 6379,                  
});

const CLIENTSIDE_URL = process.env.CLIENTSIDE_URL;

const io = new Server(httpServer, { 
    cors: {
        origin: ["http://127.0.0.1:5500", CLIENTSIDE_URL, "https://submissionservice.parthmern.store"],
        methods: ["GET", "POST"],
        credentials: true
    }
}); // socket.io server

io.on("connection", (socket) => {

    console.log("A user connected " + socket.id);

    socket.on("setUserId", async (userId) => {
        console.log("Setting user id to connection id", userId, socket.id);
        redisCache.set(userId, socket.id); 
        socket.emit("confirmSetUserId", userId); 
    });

    socket.on('getConnectionId', async (userId) => {
        const connId = await redisCache.get(userId);
        console.log("Getting connection id for user id", userId, connId);
        socket.emit('connectionId', connId);
        const everything = await redisCache.keys('*');
        
        console.log(everything)
    })

});

app.use(express.json());

var cors = require('cors')

app.use(cors({
    origin: CLIENTSIDE_URL 
  })); 

app.get("/",(req,res)=>{
    res.send("socket server up");
    console.log("socket server up");
})

app.post('/sendPayload', async (req, res) => {
    console.log("req.body", req.body);
    const { userId, payload } = req.body;
   if(!userId || !payload) {
       return res.status(400).send("Invalid request");
   }
   const socketId = await redisCache.get(userId);

   if(socketId) {
         io.to(socketId).emit('submissionPayloadResponse', payload);
         return res.send("Payload sent successfully");
    } else {
        return res.status(404).send("User not connected");
    
   }

})

const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
    console.log(`Socket Server is running on port ${PORT}`);
}); 