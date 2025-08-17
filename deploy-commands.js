
import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = await fs.readdir(commandsPath);

for (const file of commandFiles.filter(file => file.endsWith('.js'))) {
    const filePath = pathToFileURL(path.join(commandsPath, file));
    const command = await import(filePath);
    if ('data' in command.default && 'execute' in command.default) {
        commands.push(command.default.data.toJSON());
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    
    const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
    );
    
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
    console.error(error);
}