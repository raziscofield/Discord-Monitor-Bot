import { Events } from 'discord.js';

export default {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        
        
        const userId = newPresence?.userId || oldPresence?.userId;
        if (!userId) return;
        
        const client = newPresence?.client || oldPresence?.client;
        if (!client?.monitoredBots?.has(userId)) return;
        
        const oldStatus = oldPresence?.status === 'online' ? 'online' : 'offline';
        const newStatus = newPresence?.status === 'online' ? 'online' : 'offline';
        
        if (oldStatus !== newStatus) {
            console.log(`\x1b[36m[${new Date().toISOString()}] [INFO]\x1b[0m Real-time presence update detected for ${userId}: ${oldStatus} → ${newStatus}`);
        }
    }
};
