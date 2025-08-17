import TrackedBot from '../models/TrackedBot.js';

import { ActivityType } from 'discord.js';
export default {
    name: 'ready',
    once: true,
    async execute(client) {
        const timestamp = new Date().toISOString();
        console.log(`\x1b[32m[${timestamp}] [SUCCESS]\x1b[0m ${client.user.tag} is online and ready!`);
        
        // Set bot activity
        client.user.setActivity('Bot Status Changes', { type: ActivityType.Watching });
        
        // Load tracked bots into memory
        try {
            const trackedBots = await TrackedBot.find({});
            client.monitoredBots = new Map();
            
            for (const bot of trackedBots) {
                client.monitoredBots.set(bot.botId, {
                    guildId: bot.guildId,
                    lastStatus: bot.lastStatus,
                    addedBy: bot.addedBy,
                    addedAt: bot.addedAt
                });
            }
            
            console.log(`\x1b[36m[${timestamp}] [INFO]\x1b[0m Loaded ${trackedBots.length} tracked bots into memory`);
            
            // Start presence monitoring
            startPresenceMonitoring(client);
            
        } catch (error) {
            console.error(`\x1b[31m[${timestamp}] [ERROR]\x1b[0m Failed to load tracked bots:`, error);
        }
    }
};

function startPresenceMonitoring(client) {
    const monitorInterval = setInterval(async () => {
        try {
            await checkBotStatuses(client);
        } catch (error) {
            console.error('Error in presence monitoring:', error);
        }
    }, 3000); // 30 seconds
    
    client.monitorInterval = monitorInterval;
    console.log(`\x1b[36m[${new Date().toISOString()}] [INFO]\x1b[0m Started presence monitoring (30s intervals)`);
}

async function checkBotStatuses(client) {
    if (!client.monitoredBots || client.monitoredBots.size === 0) return;
    
    for (const [botId, botData] of client.monitoredBots.entries()) {
        try {
            const guild = client.guilds.cache.get(botData.guildId);
            if (!guild) continue;
            
            const member = guild.members.cache.get(botId);
            const presenceStatus = member?.presence?.status;

            // Treat online, idle, and dnd as "online"
            const currentStatus = (presenceStatus === 'online' || presenceStatus === 'idle' || presenceStatus === 'dnd') 
                ? 'online' 
                : 'offline';
            
            if (currentStatus !== botData.lastStatus) {
                await handleStatusChange(client, botId, currentStatus, botData);
                
                // Update memory
                client.monitoredBots.set(botId, {
                    ...botData,
                    lastStatus: currentStatus
                });
                
                // Update database
                await TrackedBot.updateOne(
                    { botId },
                    { 
                        lastStatus: currentStatus,
                        lastStatusChange: new Date()
                    }
                );
            }
        } catch (error) {
            console.error(`Error checking status for bot ${botId}:`, error);
        }
    }
}

async function handleStatusChange(client, botId, newStatus, botData) {
    try {
        const guild = client.guilds.cache.get(botData.guildId);
        const monitorChannel = guild.channels.cache.get(process.env.MONITOR_CHANNEL_ID);
        if (!monitorChannel) return;

        const botUser = await client.users.fetch(botId);
        const statusEmoji = newStatus === 'online' ? '<a:online:1406609183486513232>' : '<a:offline:1406610155747147806>';
        const statusText = newStatus === 'online' ? 'Online' : 'Offline';
        const statusColor = newStatus === 'online' ? 0x00ff00 : 0xff0000;

        const { EmbedBuilder } = await import('discord.js');

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `# ${botUser.username} Music Status`, 
                iconURL: botUser.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`${statusEmoji} **<@${botId}> is now ${statusText}.**`)
            .setColor(statusColor)
            .setThumbnail(botUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setTimestamp()
            .setFooter({ text: 'Powered by Razi' });

       
        const botUserFull = await client.users.fetch(botId, { force: true });
        if (botUserFull.banner) {
            embed.setImage(botUserFull.bannerURL({ dynamic: true, size: 1024 }));
        }

        await monitorChannel.send({ embeds: [embed] });
        console.log(`[${new Date().toISOString()}] ${botUser.username} (${botId}) is now ${statusText}`);
    } catch (error) {
        console.error('Error sending status change embed:', error);
    }
}

