import { Client, GatewayIntentBits, Collection, Events, ActivityType } from 'discord.js';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MonitorBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMembers
            ]
        });
        
        this.client.commands = new Collection();
        this.client.cooldowns = new Collection();
        this.monitoredBots = new Map();
        this.refreshInterval = null;
        
        this.setupEventHandlers();
    }
    
    async init() {
        try {
            await this.connectDatabase();
            await this.loadCommands();
            await this.loadEvents();
            await this.client.login(process.env.DISCORD_TOKEN);
        } catch (error) {
            this.log('ERROR', `Failed to initialize bot: ${error.message}`);
            process.exit(1);
        }
    }
    
    async connectDatabase() {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            this.log('SUCCESS', 'Connected to MongoDB successfully');
        } catch (error) {
            this.log('ERROR', `MongoDB connection failed: ${error.message}`);
            throw error;
        }
    }
    
    async loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = await fs.readdir(commandsPath);
        const jsFiles = commandFiles.filter(file => file.endsWith('.js'));
        
        let loadedCommands = 0;
        
        for (const file of jsFiles) {
            try {
                const filePath = pathToFileURL(path.join(commandsPath, file));
                const command = await import(filePath);
                
                if ('data' in command.default && 'execute' in command.default) {
                    this.client.commands.set(command.default.data.name, command.default);
                    loadedCommands++;
                } else {
                    this.log('WARNING', `Command ${file} is missing required "data" or "execute" property`);
                }
            } catch (error) {
                this.log('ERROR', `Error loading command ${file}: ${error.message}`);
            }
        }
        
        this.log('SUCCESS', `Loaded ${loadedCommands} commands`);
    }
    
    async loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = await fs.readdir(eventsPath);
        const jsFiles = eventFiles.filter(file => file.endsWith('.js'));
        
        let loadedEvents = 0;
        
        for (const file of jsFiles) {
            try {
                const filePath = pathToFileURL(path.join(eventsPath, file));
                const event = await import(filePath);
                
                if (event.default.once) {
                    this.client.once(event.default.name, (...args) => event.default.execute(...args));
                } else {
                    this.client.on(event.default.name, (...args) => event.default.execute(...args));
                }
                loadedEvents++;
            } catch (error) {
                this.log('ERROR', `Error loading event ${file}: ${error.message}`);
            }
        }
        
        this.log('SUCCESS', `Loaded ${loadedEvents} events`);
    }
    
    setupEventHandlers() {
        process.on('unhandledRejection', (reason, promise) => {
            this.log('ERROR', `Unhandled Rejection at: ${promise}, reason: ${reason}`);
        });
        
        process.on('uncaughtException', (error) => {
            this.log('ERROR', `Uncaught Exception: ${error.message}`);
        });
    }
    
    log(level, message) {
        const timestamp = new Date().toISOString();
        const colors = {
            SUCCESS: '\x1b[32m',
            ERROR: '\x1b[31m',
            WARNING: '\x1b[33m',
            INFO: '\x1b[36m',
            RESET: '\x1b[0m'
        };
        
        console.log(`${colors[level]}[${timestamp}] [${level}]${colors.RESET} ${message}`);
    }
}

const bot = new MonitorBot();
bot.init();