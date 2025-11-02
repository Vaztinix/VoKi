const express = require('express');
const axios = require('axios');
const os = require('os');
const app = express();
const port = process.env.PORT || 3000;

// ===== Tracking Variables =====
let serverStartTime = Date.now();
let errorLog = [];
let requestCount = 0;
let totalResponseTime = 0;

// ===== Middleware to Track Requests =====
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestCount++;
    totalResponseTime += duration;
  });
  next();
});

// ===== Error Handling =====
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  errorLog.push({
    type: 'Exception',
    message: err.message,
    stack: err.stack,
    time: new Date()
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  errorLog.push({
    type: 'Rejection',
    message: reason?.message || reason,
    stack: reason?.stack || null,
    time: new Date()
  });
});

// ===== Express Routes =====
app.get('/', (req, res) => {
  res.send('✅ VoKi AI Website is online and running smoothly!');
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ===== System Info Helper =====
function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;

  cpus.forEach((core) => {
    for (let type in core.times) totalTick += core.times[type];
    totalIdle += core.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usagePercent = (1 - idle / total) * 100;
  return usagePercent.toFixed(2);
}

// ===== Discord Webhook Hourly Report =====
async function sendHourlyReport() {
  const uptimeMs = Date.now() - serverStartTime;
  const uptimeHours = Math.floor(uptimeMs / 3600000);
  const uptimeMinutes = Math.floor((uptimeMs % 3600000) / 60000);

  const memory = process.memoryUsage();
  const cpuUsage = getCPUUsage();
  const avgResponse = requestCount > 0 ? (totalResponseTime / requestCount).toFixed(2) : 0;

  const embed = {
    username: "VoKi Server Monitor",
    avatar_url: "https://i.imgur.com/AfFp7pu.png",
    embeds: [
      {
        title: "📊 Hourly Server Report",
        color: 0x1abc9c,
        timestamp: new Date(),
        fields: [
          { name: "Uptime", value: `${uptimeHours}h ${uptimeMinutes}m`, inline: true },
          { name: "Requests", value: `${requestCount}`, inline: true },
          { name: "Avg Response", value: `${avgResponse} ms`, inline: true },
          { name: "CPU Usage", value: `${cpuUsage}%`, inline: true },
          {
            name: "Memory Usage",
            value: `RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB\nHeap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            inline: true
          },
          { name: "Node Version", value: process.version, inline: true },
          {
            name: "Errors Logged",
            value: errorLog.length > 0
              ? errorLog.map((e, i) => `${i + 1}. [${e.type}] ${e.message}`).join("\n")
              : "No errors this hour 🎉",
            inline: false
          }
        ],
        footer: { text: "VoKi Monitoring System | Automated Report" }
      }
    ]
  };

  try {
    await axios.post(
      'https://discord.com/api/webhooks/1434331220250202164/-dqQ-YjTFDyNIb7rY4HxLml6L1SZOxvZsgFnZSiIpAgN1KKDHRgQVLz2jP7Kv061QUW4',
      embed
    );
    console.log('✅ Hourly report sent successfully!');
    // Reset hourly counters
    errorLog = [];
    requestCount = 0;
    totalResponseTime = 0;
  } catch (err) {
    console.error('❌ Failed to send hourly report:', err.message);
  }
}

// ===== Send Report Every Hour =====
setInterval(sendHourlyReport, 1000 * 60 * 60); // every 1 hour
