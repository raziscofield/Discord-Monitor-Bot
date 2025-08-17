# Discord Monitor Bot

A **powerful modular monitoring bot** for Discord that tracks other bots' presence (online/offline/idle/dnd) and provides real-time updates in your server with rich embeds and interactive components. Built with **Discord.js v14**, fully modular, and production-ready.

---

## Features

- **Bot Presence Monitoring**  
  - Tracks any bot in your server  
  - Treats `online`, `idle`, and `dnd` as **online**  
  - Sends a live update when a bot goes online or offline  

- **Rich Embed Notifications**  
  - Includes bot avatar and banner  
  - Shows who added the bot to the monitor  
  - Color-coded statuses (🟢 Online / 🔴 Offline)  
  - Timestamp and quick-access buttons (view profile, refresh, remove)  

- **Interactive Component v2 System**  
  - Fully uses `ActionRowBuilder` and `ButtonBuilder` (Discord components v2)  
  - Editable messages (updates previous embed instead of sending spam)  

- **Slash Commands**  
  - `/addbot <bot_id>` – Start monitoring a bot  
  - `/removebot <bot_id>` – Stop monitoring a bot  
  - `/help` – See available commands and usage  

- **Database Integration (MongoDB)**  
  - Saves tracked bots  
  - Keeps last status, last status change, and message IDs  
  - Automatically reloads monitored bots on restart  

- **Configurable Monitor Channel**  
  - All notifications are sent to a defined channel (`MONITOR_CHANNEL_ID` in `.env`)  

---

## Tech Stack

- [Node.js](https://nodejs.org/) (LTS recommended)  
- [Discord.js v14](https://discord.js.org/#/)  
- [MongoDB](https://www.mongodb.com/) for persistent bot tracking  
- [dotenv](https://github.com/motdotla/dotenv) for environment variables  

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/raziscofield/discord-monitor-bot.git
cd discord-monitor-bot
