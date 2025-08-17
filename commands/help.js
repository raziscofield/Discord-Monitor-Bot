import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands and usage instructions'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 Discord Monitor Bot - Help')
            .setDescription('Advanced bot monitoring system with real-time presence tracking')
            .addFields(
                {
                    name: '📋 Available Commands',
                    value: '```\n/addbot <bot_id>    - Add a bot to monitoring\n/removebot <bot_id> - Remove a bot from monitoring\n/help              - Show this help menu\n```',
                    inline: false
                },
                {
                    name: '🎯 How to Use',
                    value: '• Use `/addbot` with a bot\'s User ID to start monitoring\n• The system will automatically track online/offline status\n• Use `/removebot` to stop monitoring a specific bot\n• Status changes are posted in real-time with rich embeds',
                    inline: false
                },
                {
                    name: '✨ Features',
                    value: '• **Real-time monitoring** - 30-second refresh intervals\n• **Rich embeds** - Bot avatars, banners, and status colors\n• **Interactive buttons** - Quick actions and profile links\n• **Persistent storage** - MongoDB database integration\n• **Error handling** - Rate-limit safe with proper logging',
                    inline: false
                },
                {
                    name: '🔧 Status Indicators',
                    value: '🟢 **Online** - Bot is active and responsive\n🔴 **Offline** - Bot is disconnected or inactive\n⚪ **Unknown** - Status cannot be determined',
                    inline: false
                },
                {
                    name: '💡 Pro Tips',
                    value: '• Right-click a bot → Copy ID to get their User ID\n• The bot must be in the same server to track presence\n• Status changes are logged with timestamps\n• Use buttons in status messages for quick actions',
                    inline: false
                }
            )
            .setColor(0x5865f2)
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setTimestamp()
            .setFooter({ 
                text: 'Monitor System v1.0 | Made with ❤️', 
                iconURL: interaction.client.user.displayAvatarURL() 
            });
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Add Bot')
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('help_addbot')
                    .setEmoji('➕'),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/your-support-server')
                    .setEmoji('❓'),
                new ButtonBuilder()
                    .setLabel('Documentation')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://github.com/your-repo/discord-monitor-bot')
                    .setEmoji('📚')
            );
        
        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
