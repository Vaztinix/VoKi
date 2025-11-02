const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// ===== Track Uptime & Errors =====
let serverStartTime = Date.now();
let errorLog = [];

// Catch unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  errorLog.push({ type: 'Exception', message: err.message, stack: err.stack, time: new Date() });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  errorLog.push({ type: 'Rejection', message: reason?.message || reason, stack: reason?.stack || null, time: new Date() });
});

// ===== Express Routes =====
app.get('/', (req, res) => {
  res.send('VoKi AI Website is running!');
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ===== Discord Webhook Report Function =====
async function sendHourlyReport() {
  const uptime = Date.now() - serverStartTime;
  const memoryUsage = process.memoryUsage();
  const nodeVersion = process.version;

  const embed = {
    username: "VoKi Server Monitor",
    avatar_url: "https://i.imgur.com/AfFp7pu.png", // optional bot avatar
    embeds: [
      {
        title: "Hourly Server Report",
        color: 0x1abc9c,
        timestamp: new Date(),
        fields: [
          { name: "Uptime", value: `${Math.floor(uptime / 1000 / 60)} minutes`, inline: true },
          { name: "Memory Usage", value: `RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB\nHeap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
          { name: "Node Version", value: nodeVersion, inline: true },
          { name: "Errors This Hour", value: errorLog.length > 0 ? errorLog.map((e, i) => `${i+1}. [${e.type}] ${e.message}`).join("\n") : "No errors", inline: false }
        ]
      }
    ]
  };

  try {
    await axios.post('https://discord.com/api/webhooks/1434331220250202164/-dqQ-YjTFDyNIb7rY4HxLml6L1SZOxvZsgFnZSiIpAgN1KKDHRgQVLz2jP7Kv061QUW4', embed);
    console.log('Hourly report sent successfully!');
    // Reset error log after sending report
    errorLog = [];
  } catch (err) {
    console.error('Failed to send hourly report:', err.message);
  }
}

// ===== Send Report Every Hour =====
setInterval(sendHourlyReport, 1000 * 60 * 60); // 1 hour interval
