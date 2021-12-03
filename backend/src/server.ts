// @ts-nocheck
import  express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import randomstring from "randomstring"
import { MongoClient } from 'mongodb'
var cors = require('cors')

// Connection URL
const url = 'mongodb+srv://overclockedbrains:loomhackathon@cluster0.k2mtp.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);
let collection = null;
let collection1 = null;

const app = express();
app.use(express.json());
app.use(cors());

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server, path: "/ws" });

let rooms = {}

app.get("/rooms",(req,res)=>{
    res.send(rooms)
})

app.post("/loomsdk/insert", async (req,res) =>{
    try{
        let data = req.body;
        console.log(data)
        let url = data.url;
        let roomid = data.roomid;
        let name = data.name;
        let activity_name = data.activity_name;
        if(url && roomid){
            await collection.insertOne({ name, roomid, activity_name, url, timestamp: Date.now() });
        }
    }catch(e){
        console.error(e)
    }
    res.sendStatus(200);
})

app.post("/activity/insert", async (req,res) =>{
    try{
        let data = req.body;
        console.log(data)
        let url = data.url;
        let roomid = data.roomid;
        let name = data.name;
        if(url && roomid){
            await collection1.insertOne({ name, roomid, url, timestamp: Date.now() });
        }
    }catch(e){
        console.error(e)
    }
    res.sendStatus(200);
})

app.get("/activity/:roomid", async (req,res) =>{
    try{
        let roomid = req.params.roomid;
        let cursor = collection1.find({
            roomid
        }).sort({timestamp: -1});
        let data = [{'name':'Sing A Song - lyrc','url':'https://lyric.mackle.im/',timestamp:0},{'name':'My XMAS Tree','url':'',timestamp:0},{'name':'Maze Game','url':'https://mazegame.b-cdn.net/',timestamp:0},{'name':'Win Against Corona','url':'https://win-against-corona-vir.us/',timestamp:0}];
        await cursor.forEach((e)=>{
            data.push(e)
        });
        res.send({'sucess':true,data})
    }catch(e){
        console.error(e)
        res.send({'sucess':false})
    }  
})

app.get("/loomsdk/videos/:roomid",async (req,res) =>{
    try{
        let roomid = req.params.roomid;
        let cursor = collection.find({
            roomid
        }).sort({timestamp: -1});
        let data = [];
        await cursor.forEach((e)=>{
            data.push(e)
        });
        res.send({'sucess':true,data})
    }catch(e){
        console.error(e)
        res.send({'sucess':false})
    }  
})

wss.on('connection', (ws: WebSocket) => {
    ws.binaryType = 'arraybuffer';
    ws.id = randomstring.generate(7);
    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
        try{
            if(typeof message!="string"){
                if(message.byteLength==6){
                    rooms[ws.room]['users'][ws.intid]['position'] = Buffer.from(message)
                    let a = Buffer.alloc(1)
                    a=((a^ws.intid)<<2)^1
                    let payload = Buffer.concat([Buffer.from([a]),Buffer.from(message)])
                    for(let user in rooms[ws.room]['users']){
                        if(user!=ws.intid &&  rooms[ws.room]['users'][user].hasOwnProperty("ws")){
                            rooms[ws.room]['users'][user]["ws"].send(payload)
                        }
                        if(rooms[ws.room]['users'][ws.intid]['new_user'] && user!=ws.intid && rooms[ws.room]['users'][user].hasOwnProperty("position")){
                            let b = Buffer.alloc(1)
                            b=((b^user)<<2)^1
                            let tp = Buffer.concat([Buffer.from([b]),rooms[ws.room]['users'][user]['position']])
                            ws.send(tp)
                            ws.send(JSON.stringify({response:'rgb', id: user, rgb: rooms[ws.room]['users'][user]['rgb']}))
                            rooms[ws.room]['users'][user]["ws"].send(JSON.stringify({response:'rgb', id: ws.intid, rgb: rooms[ws.room]['users'][ws.intid]['rgb']}))
                        }
                    }
                    if(rooms[ws.room]['users'][ws.intid]['new_user']){
                        rooms[ws.room]['users'][ws.intid]['new_user']=false;
                    }
                }else if(message.byteLength==9){
                    let a = Buffer.alloc(1)
                    a=((a^ws.intid)<<2)
                    let payload = Buffer.concat([Buffer.from([a]),Buffer.from(message)])
                    for(let user in rooms[ws.room]['users']){
                        if(user!=ws.intid &&  rooms[ws.room]['users'][user].hasOwnProperty("ws")){
                            rooms[ws.room]['users'][user]["ws"].send(payload)
                        }
                    }
                }
            }else{
                message = JSON.parse(message)
                if(message.action == "join"){
                    if(!rooms.hasOwnProperty(message.room)){
                        rooms[message.room] = { users:{ } }
                        for(let i=0;i<100;i++){
                            rooms[message.room]['users'][i]={ }
                        }
                    }
                    for(let i =0;i<100;i++){
                        if(Object.keys(rooms[message.room]['users'][i]).length==0){
                            ws.intid = i;
                            rooms[message.room]['users'][i]["id"]=ws.id;
                            rooms[message.room]['users'][i]["new_user"] = true
                            rooms[message.room]['users'][i]["rgb"] = [Math.random().toFixed(2), Math.random().toFixed(2), Math.random().toFixed(2)]
                            break;
                        }
                    }
                    rooms[message.room].users[ws.intid]["ws"] = ws;
                    ws.room = message.room;
                    console.log(`User ${ws.id}-${ws.intid} joined ${ws.room} room`)
                    ws.send(JSON.stringify({ response: "room_joined", id: ws.intid, rgb: rooms[message.room].users[ws.intid]["rgb"] }))
                }else if(message.action == "sync"){
                    for(let user in rooms[ws.room]['users']){
                        if(rooms[ws.room]['users'][user].hasOwnProperty("ws")){
                            rooms[ws.room]['users'][user]["ws"].send(JSON.stringify({ response: "sync"}))
                        }
                    }
                }
            }
        }catch(e){
            console.log("Error: ws.on.message: "+e)
        }
    });

    ws.on('close',()=>{
        try{
            rooms[ws.room].users[ws.intid] = {}
            let a = Buffer.alloc(1)
            a=((a^ws.intid)<<2)^3
            let payload = Buffer.from([a])
            for(let user in rooms[ws.room]['users']){
                if(user!=ws.intid &&  rooms[ws.room]['users'][user].hasOwnProperty("ws")){
                    rooms[ws.room]['users'][user]["ws"].send(payload)
                }
            }
            console.log(`User ${ws.id}-${ws.intid} exited ${ws.room} room`)
        }catch(e){
            console.log("Error: ws.on.close: "+e)
        }
    })
});

//start our server
(async ()=>{
    await client.connect();
    const db = client.db('myFirstDatabase');
    collection = db.collection('videos_data');
    collection1 = db.collection('activty_data');
    console.log('DB connected!')
    server.listen(process.env.PORT || 3000, () => {
        console.log(`Server started on port ${server.address().port} :)`);
    });
})()