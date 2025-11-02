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
let lastCPUUsage = 0;
let restartNotified = false;
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1434331220250202164/-dqQ-YjTFDyNIb7rY4HxLml6L1SZOxvZsgFnZSiIpAgN1KKDHRgQVLz2jP7Kv061QUW4';

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
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await sendRestartNotice();
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

// ===== Discord Webhook: Restart Alert =====
async function sendRestartNotice() {
  if (restartNotified) return;
  restartNotified = true;

  const embed = {
    username: "VoKi Server Monitor",
    avatar_url: "https://i.imgur.com/AfFp7pu.png",
    embeds: [
      {
        title: "🔁 Server Restart Detected",
        description: "The VoKi server has restarted successfully.",
        color: 0xffcc00,
        timestamp: new Date(),
        fields: [
          { name: "Node Version", value: process.version, inline: true },
          { name: "System", value: `${os.type()} ${os.release()} (${os.arch()})`, inline: true },
          { name: "Hostname", value: os.hostname(), inline: true },
          { name: "Memory Usage", value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, inline: true }
        ],
        footer: { text: "VoKi Monitoring System | Auto Restart Alert" }
      }
    ]
  };

  try {
    await axios.post(WEBHOOK_URL, embed);
    console.log('⚠️ Restart alert sent to Discord.');
  } catch (err) {
    console.error('❌ Failed to send restart alert:', err.message);
  }
}

// ===== Discord Webhook: Slow Performance Alert =====
async function sendPerformanceAlert(cpu, avgResponse) {
  const embed = {
    username: "VoKi Server Monitor",
    avatar_url: "https://i.imgur.com/AfFp7pu.png",
    embeds: [
      {
        title: "🚨 Performance Warning",
        color: 0xe74c3c,
        timestamp: new Date(),
        fields: [
          { name: "CPU Usage", value: `${cpu}%`, inline: true },
          { name: "Avg Response", value: `${avgResponse} ms`, inline: true },
          { name: "Memory", value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
          { name: "Action", value: "Investigate load or restart system if lag persists.", inline: false }
        ],
        footer: { text: "VoKi Monitoring System | Slow Performance Alert" }
      }
    ]
  };

  try {
    await axios.post(WEBHOOK_URL, embed);
    console.log('⚠️ Performance alert sent to Discord.');
  } catch (err) {
    console.error('❌ Failed to send performance alert:', err.message);
  }
}

// ===== Hourly Report =====
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
    await axios.post(WEBHOOK_URL, embed);
    console.log('✅ Hourly report sent successfully!');
    // Reset hourly counters
    errorLog = [];
    requestCount = 0;
    totalResponseTime = 0;
  } catch (err) {
    console.error('❌ Failed to send hourly report:', err.message);
  }
}

// ===== Performance Check Every 5 Minutes =====
setInterval(() => {
  const cpuUsage = parseFloat(getCPUUsage());
  const avgResponse = requestCount > 0 ? (totalResponseTime / requestCount).toFixed(2) : 0;

  if (cpuUsage > 85 || avgResponse > 1000) {
    sendPerformanceAlert(cpuUsage, avgResponse);
  }
  lastCPUUsage = cpuUsage;
}, 1000 * 60 * 5); // every 5 minutes

// ===== Send Hourly Report =====
setInterval(sendHourlyReport, 1000 * 60 * 60); // every hour
