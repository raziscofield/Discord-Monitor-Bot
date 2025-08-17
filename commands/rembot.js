// commands/removebot.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import TrackedBot from '../models/TrackedBot.js';

export default {
    data: new SlashCommandBuilder()
        .setName('removebot')
        .setDescription('Remove a bot from the monitoring list')
        .addStringOption(option =>
            option
                .setName('bot_id')
                .setDescription('The ID of the bot to remove from monitoring')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const botId = interaction.options.getString('bot_id');
        
        try {
            const trackedBot = await TrackedBot.findOneAndDelete({ 
                botId, 
                guildId: interaction.guildId 
            });
            
            if (!trackedBot) {
                return interaction.reply({
                    content: '❌ This bot is not currently being monitored.',
                    ephemeral: true
                });
            }
            
            // Get bot info for embed
            const targetUser = await interaction.client.users.fetch(botId).catch(() => null);
            
            const embed = new EmbedBuilder()
                .setTitle('🗑️ Bot Removed from Monitor List')
                .setDescription(`**${targetUser?.username || 'Unknown Bot'}** has been removed from monitoring.`)
                .addFields(
                    { name: '🤖 Bot Name', value: targetUser?.username || 'Unknown', inline: true },
                    { name: '🆔 Bot ID', value: botId, inline: true },
                    { name: '👤 Removed by', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setColor(0xff6b35)
                .setTimestamp()
                .setFooter({ 
                    text: 'Monitor System', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            
            if (targetUser) {
                embed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }));
            }
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in removebot command:', error);
            await interaction.reply({
                content: '❌ An error occurred while removing the bot from the monitor list.',
                ephemeral: true
            });
        }
    }
};
