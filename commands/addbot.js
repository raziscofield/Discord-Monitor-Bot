import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import TrackedBot from '../models/TrackedBot.js';

export default {
    data: new SlashCommandBuilder()
        .setName('addbot')
        .setDescription('Add a bot to the monitoring list')
        .addStringOption(option =>
            option
                .setName('bot_id')
                .setDescription('The ID of the bot to monitor')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const botId = interaction.options.getString('bot_id');
    
        if (!/^\d{17,19}$/.test(botId)) {
            return interaction.reply({
                content: '❌ Invalid bot ID format. Please provide a valid Discord user ID.',
                ephemeral: true
            });
        }
        
        try {
          
            const targetUser = await interaction.client.users.fetch(botId).catch(() => null);
            
            if (!targetUser) {
                return interaction.reply({
                    content: '❌ Could not find a user with that ID.',
                    ephemeral: true
                });
            }
            
            if (!targetUser.bot) {
                return interaction.reply({
                    content: '❌ The specified user is not a bot.',
                    ephemeral: true
                });
            }
            
       
            const existingBot = await TrackedBot.findOne({ botId, guildId: interaction.guildId });
            
            if (existingBot) {
                return interaction.reply({
                    content: '❌ This bot is already being monitored.',
                    ephemeral: true
                });
            }
            
      
            const trackedBot = new TrackedBot({
                botId,
                guildId: interaction.guildId,
                addedBy: interaction.user.id
            });
            
            await trackedBot.save();
            
            
            const guild = interaction.guild;
            const member = guild.members.cache.get(botId);
            const currentStatus = member?.presence?.status || 'offline';
            
           
            trackedBot.lastStatus = currentStatus === 'online' ? 'online' : 'offline';
            await trackedBot.save();
            
           
            const embed = new EmbedBuilder()
                .setTitle('🎯 Bot Added to Monitor List')
                .setDescription(`**${targetUser.username}** is now being monitored!`)
                .addFields(
                    { name: '🤖 Bot Name', value: targetUser.username, inline: true },
                    { name: '🆔 Bot ID', value: botId, inline: true },
                    { name: '🟢 Current Status', value: currentStatus === 'online' ? '🟢 Online' : '🔴 Offline', inline: true },
                    { name: '👤 Added by', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '📅 Added at', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
                .setColor(currentStatus === 'online' ? 0x00ff00 : 0xff0000)
                .setTimestamp()
                .setFooter({ 
                    text: 'Monitor System', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            
          
            const targetUserFull = await interaction.client.users.fetch(botId, { force: true });
            if (targetUserFull.banner) {
                embed.setImage(targetUserFull.bannerURL({ dynamic: true, size: 1024 }));
            }
            
            const row = new ActionRowBuilder();
            
            
            if (currentStatus === 'online') {
                row.addComponents(
                    new ButtonBuilder()
                        .setLabel('View Bot Profile')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/users/${botId}`)
                        .setEmoji('🔗'),
                    new ButtonBuilder()
                        .setCustomId(`remove_bot_${botId}`)
                        .setLabel('Remove from List')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🗑️')
                );
            } else {
                row.addComponents(
                    new ButtonBuilder()
                        .setLabel('View Bot Profile')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/users/${botId}`)
                        .setEmoji('🔗'),
                    new ButtonBuilder()
                        .setCustomId(`remove_bot_${botId}`)
                        .setLabel('Remove from List')
                        .setStyle(ButtonStyle.Secondary) 
                        .setEmoji('🗑️')
                );
            }
            
            await interaction.reply({ embeds: [embed], components: [row] });
            
        } catch (error) {
            console.error('Error in addbot command:', error);
            await interaction.reply({
                content: '❌ An error occurred while adding the bot to the monitor list.',
                ephemeral: true
            });
        }
    }
};
