require('dotenv').config();
const app = require('./src/app');
const { createServer } = require("http");
const { Server } = require("socket.io");
const { generateResponse } = require('./src/service/ai.service')

const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

    socket.on("user-prompt", async (data) => {

        console.log("Received user prompt:", data.prompt);
        try {
            const response = await generateResponse(data.prompt);
            console.log("Generated response:", response);
            socket.emit("bot-response", { response });
        } catch (error) {
            console.error("Error generating response:", error);
            socket.emit("bot-response", { response: "Sorry, I couldn't process your request." });
        }

    })

});

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});