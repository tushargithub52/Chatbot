require('dotenv').config();
const app = require('./src/app');
const { createServer } = require("http");
const { Server } = require("socket.io");
const { generateResponse } = require('./src/service/ai.service');
const { text } = require('stream/consumers');

const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: "http://localhost:5173",  
    }
 });

const chatHistory = [];

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

    socket.on("user-prompt", async (data) => {

        console.log("Received user prompt:", data);

        // Store the prompt in chat history
        chatHistory.push({
            role: "user",
            parts: [ { text: data }]
        });

        try {
            const response = await generateResponse(chatHistory);
            console.log("Generated response:", response);
            
            // Store the response in chat history
            chatHistory.push({
                role: "model",
                parts: [ { text: response }]
            });
            
            socket.emit("bot-response", response);
        } catch (error) {
            console.error("Error generating response:", error);
            socket.emit("bot-response", { response: "Sorry, I couldn't process your request." });
        }

    })

});

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});