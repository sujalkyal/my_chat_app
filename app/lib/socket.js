import { WebSocketServer } from "ws";
import { createServer } from "http";
import prisma from "@/db";

const server = createServer();
const wss = new WebSocketServer({server});

const activeUsers = new Map();

wss.on("connection", async (ws,req) => {
    const userId = req.headers["userId"];

    if(!userId){
        ws.close();
        return;
    }

    ws.userId = userId;
    activeUsers.set(userId, ws);

    console.log(`User ${userId} connected`);

    ws.on("message",async (message)=>{
        try{
            const {chatRoomId, message: content} = JSON.parse(message);

            const chatRoom = await prisma.chatRoom.findUnique({
                where: {id: chatRoomId},
            })

            if(!chatRoom){
                ws.send(JSON.stringify({ error: "Chat room doesn't exist"}));
                return;
            }

            const newMessage = await prisma.message.create({
                data: {
                    content,
                    senderId: userId,
                    chatRoomId
                }
            })

            // send message to all users in the chat room
        }catch (e){
            console.error("Error processing the message", e);
        }
    })
    ws.on("close",()=>{
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
    })
})

server.listen(3001,()=>{console.log("Web Socket Server running on port 3001")});

export default function handler(req, res) {
    res.status(405).end();
}