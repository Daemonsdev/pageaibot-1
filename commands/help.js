const helpCommand = {
    name: "help",
    execute(messageText) {
        let response;

        if (messageText === 'hi' || messageText === 'hello') {
            response = { "text": "Hello! How can I assist you today?" };
        } else if (messageText === 'help') {
            response = { "text": "Here are some commands you can use: hi, hello, help." };
        } else {
            response = { "text": `You sent the message: "${messageText}". Now send me an image!` };
        }

        return response;
    }
};

module.exports = helpCommand;
