/**
 * VoKi Server Monitor + Express Runtime
 * --------------------------------------
 * Provides web hosting, performance tracking, hourly reporting,
 * and proactive error management.
 */

const express = require('express');
const axios = require('axios');
const os = require('os');
const app = express();
const port = process.env.PORT || 3000;

// ====== CONFIGURATION ======
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1434331220250202164/-dqQ-YjTFDyNIb7rY4HxLml6L1SZOxvZsgFnZSiIpAgN1KKDHRgQVLz2jP7Kv061QUW4';

// ====== TRACKING VARIABLES ======
let serverStartTime = Date.now();
let errorLog = [];
let requestCount = 0;
let totalResponseTime = 0;
let totalRequestsAllTime = 0;

// ====== MIDDLEWARE: Request Tracking ======
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestCount++;
    totalRequestsAllTime++;
    totalResponseTime += duration;
  });
  next();
});

// ====== ERROR HANDLING ======
process.on('uncaughtException', (err) => handleError('Exception', err));
process.on('unhandledRejection', (reason) => handleError('Rejection', reason));

function handleError(type, err) {
  console.error(`[${type}]`, err);
  errorLog.push({
    type,
    message: err.message || err,
    stack: err.stack || null,
    time: new Date()
  });
}

// ====== BASIC ROUTES ======
app.get('/', (req, res) => {
  res.send('✅ VoKi AI Website is online and running smoothly!');
});

app.get('/status', (req, res) => {
  const uptime = Date.now() - serverStartTime;
  res.json({
    status: 'online',
    uptime_ms: uptime,
    requests_this_hour: requestCount,
    total_requests: totalRequestsAllTime,
    errors_this_hour: errorLog.length
  });
});

// ====== START SERVER ======
app.listen(port, async () => {
  console.log(`🌐 VoKi Server running on port ${port}`);
  await sendStartupReport();
});

// ====== SYSTEM INFO HELPERS ======
function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;

  cpus.forEach(core => {
    for (let type in core.times) totalTick += core.times[type];
    totalIdle += core.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  return ((1 - idle / total) * 100).toFixed(2);
}

function formatUptime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

// ====== DISCORD WEBHOOK FUNCTIONS ======
async function sendToWebhook(embed) {
  try {
    await axios.post(WEBHOOK_URL, embed);
  } catch (err) {
    console.error('❌ Webhook failed:', err.message);
  }
}

async function sendStartupReport() {
  const embed = {
    username: "VoKi Server Monitor",
    avatar_url: "https://i.imgur.com/AfFp7pu.png",
    embeds: [{
      title: "🚀 Server Started",
      color: 0x5865F2,
      timestamp: new Date(),
      description: "The VoKi AI Website backend has started successfully.",
      fields: [
        { name: "Host", value: os.hostname(), inline: true },
        { name: "Platform", value: os.platform(), inline: true },
        { name: "Node.js Version", value: process.version, inline: true },
        { name: "Start Time", value: new Date().toLocaleString(), inline: false }
      ],
      footer: { text: "VoKi Monitoring System | Startup Notice" }
    }]
  };
  await sendToWebhook(embed);
}

async function sendHourlyReport() {
  const uptime = Date.now() - serverStartTime;
  const memory = process.memoryUsage();
  const cpuUsage = getCPUUsage();
  const avgResponse = requestCount > 0 ? (totalResponseTime / requestCount).toFixed(2) : 0;

  const embed = {
    username: "VoKi Server Monitor",
    avatar_url: "https://i.imgur.com/AfFp7pu.png",
    embeds: [{
      title: "📊 Hourly Server Report",
      color: 0x1ABC9C,
      timestamp: new Date(),
      fields: [
        { name: "Uptime", value: formatUptime(uptime), inline: true },
        { name: "Requests (this hour)", value: `${requestCount}`, inline: true },
        { name: "Total Requests", value: `${totalRequestsAllTime}`, inline: true },
        { name: "Avg Response", value: `${avgResponse} ms`, inline: true },
        { name: "CPU Usage", value: `${cpuUsage}%`, inline: true },
        {
          name: "Memory Usage",
          value: `RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB\nHeap: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          inline: true
        },
        { name: "Errors Logged", value: errorLog.length > 0
            ? errorLog.map((e, i) => `${i + 1}. [${e.type}] ${e.message}`).join("\n")
            : "No errors this hour 🎉", inline: false }
      ],
      footer: { text: "VoKi Monitoring System | Automated Hourly Report" }
    }]
  };

  await sendToWebhook(embed);

  // Reset hourly counters
  errorLog = [];
  requestCount = 0;
  totalResponseTime = 0;
}

// ====== REPORT SCHEDULING ======
setInterval(sendHourlyReport, 1000 * 60 * 60); // every hour

// ====== Optional: Keepalive Pings for Hosting Platforms ======
setInterval(() => {
  axios.get(`http://localhost:${port}/status`).catch(() => {});
}, 1000 * 60 * 5); // every 5 minutes
