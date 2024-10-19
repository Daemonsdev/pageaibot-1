const axios = require('axios');

const aiCommand = {
    name: "ai",
    async execute(prompt) {
        try {
            const aiResponse = await axios.get(`https://heru-ai-1kgm.vercel.app/heru?prompt=${encodeURIComponent(prompt)}`);
            return aiResponse.data.response;
        } catch (error) {
            console.error("Error calling AI API:", error);
            return "Sorry, I couldn't process your request at the moment.";
        }
    }
};

module.exports = aiCommand;