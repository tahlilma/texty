import * as Discord from 'discord.js';
import * as Tesseract from 'tesseract.js';
import * as dotenv from 'dotenv';

dotenv.config();
const client = new Discord.Client();

let token = process.env.TOKEN;
let prefix = process.env.PREFIX;

// Text Recognization Part
const worker = Tesseract.createWorker({
    logger: m => {
        console.log(m);
    }
});

async function textRecognizer(link) {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(link);
    console.log(text);
    return text;
}

const urlValidator = (url) => {
    try {
        new URL(url);
    } catch (e) {
        console.log(e);
        return false;
    }
    return true;
}

// Discord Part
client.on('ready', () => {
    console.log('Bot Started');
    client.user.setPresence({
        activity : {
            name: `for ${prefix}help`,
            type: 'WATCHING'
        }
    });
});

client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    
    // Help Command
    if (command === 'help') {
        let helpEmbed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Manual and Instructions about the bot here')
            .setURL('https://texty-help.netlify.app/')
        message.channel.send(helpEmbed);
    }
    
    // Recognize Command
    if (command === 'recognize') {
        if (args.length === 0) {
            message.channel.send('**Please pass in a link to an image.**');
        } else if (urlValidator(args[0]) && /png|jpg|bmp|pbm/g.test(args[0])) {
            let sender = `<@${message.member.id}>`

            let startEmbed = new Discord.MessageEmbed()
                .setColor('RANDOM')
                .setTitle('Started')
                .addFields(
                    {
                        name: 'Requested By',
                        value: sender 
                    },
                    { 
                        name: 'Backend Started', 
                        value: 'The Link Has Been Passed To The Backend and Unless Anything Fails You Should Get The Result Soon.'
                    }
                );
            message.reply(startEmbed);
            
            let verifiedUrl = args[0];
            let recognizedText = await textRecognizer(verifiedUrl);
            
            let resultEmbed = new Discord.MessageEmbed()
                .setColor('RANDOM')
                .setTitle('Texty')
                .addFields(
                    { 
                        name: 'Requested By', 
                        value: sender 
                    },
                    { 
                        name: 'Recognized Text', 
                        value: recognizedText 
                    }
                )
                .setImage(args[0])
                .setTimestamp();
            message.channel.send(resultEmbed);
        } else {
            message.channel.send('**Please enter a proper url which ends in the formats mentioned in the help document.**');
        }
    }
});

client.login(token);
