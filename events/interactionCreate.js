import { Events } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            
            
            const { cooldowns } = interaction.client;
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Map());
            }
            
            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
            
            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({
                        content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                        ephemeral: true
                    });
                }
            }
            
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error('Error executing command:', error);
                
                const errorMessage = {
                    content: '❌ There was an error while executing this command!',
                    ephemeral: true
                };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
        
       
        else if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
        }
    }
};

async function handleButtonInteraction(interaction) {
    const customId = interaction.customId;
    
    if (customId.startsWith('remove_bot_')) {
        const botId = customId.replace('remove_bot_', '');
        
        try {
            const { default: TrackedBot } = await import('../models/TrackedBot.js');
            
            const trackedBot = await TrackedBot.findOneAndDelete({ 
                botId, 
                guildId: interaction.guildId 
            });
            
            if (!trackedBot) {
                return interaction.reply({
                    content: '❌ This bot is no longer being monitored.',
                    ephemeral: true
                });
            }
            
            // Remove from memory
            interaction.client.monitoredBots?.delete(botId);
            
            const botUser = await interaction.client.users.fetch(botId).catch(() => null);
            
            await interaction.reply({
                content: `✅ **${botUser?.username || 'Bot'}** has been removed from the monitoring list.`,
                ephemeral: true
            });
            
        } catch (error) {
            console.error('Error removing bot:', error);
            await interaction.reply({
                content: '❌ An error occurred while removing the bot.',
                ephemeral: true
            });
        }
    }
    
    else if (customId.startsWith('refresh_status_')) {
        const botId = customId.replace('refresh_status_', '');
        
        try {
            const guild = interaction.guild;
            const member = guild.members.cache.get(botId);
            const currentStatus = member?.presence?.status === 'online' ? 'online' : 'offline';
            const statusEmoji = currentStatus === 'online' ? '🟢' : '🔴';
            
            await interaction.reply({
                content: `🔄 **Status Refreshed**: ${statusEmoji} ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}`,
                ephemeral: true
            });
            
        } catch (error) {
            console.error('Error refreshing status:', error);
            await interaction.reply({
                content: '❌ An error occurred while refreshing the status.',
                ephemeral: true
            });
        }
    }
    
    else if (customId === 'help_addbot') {
        await interaction.reply({
            content: '💡 **Quick Tip**: Use `/addbot <bot_id>` to add a bot to monitoring!\n\n' +
                    '**How to get a Bot ID:**\n' +
                    '1. Right-click on the bot\n' +
                    '2. Select "Copy User ID"\n' +
                    '3. Use the ID with the `/addbot` command',
            ephemeral: true
        });
    }
}
