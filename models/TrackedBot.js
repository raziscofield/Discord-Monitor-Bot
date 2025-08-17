import mongoose from 'mongoose';

const trackedBotSchema = new mongoose.Schema({
    botId: {
        type: String,
        required: true,
        unique: true
    },
    guildId: {
        type: String,
        required: true
    },
    addedBy: {
        type: String,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    lastStatus: {
        type: String,
        enum: ['online', 'offline', 'unknown'],
        default: 'unknown'
    },
    lastStatusChange: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('TrackedBot', trackedBotSchema);