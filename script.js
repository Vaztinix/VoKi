<script>
/* VoKi Website Activity Tracker — Full Session Summary
   ----------------------------------------------------
   Tracks time spent, browser, device, referrer, and page count.
   Sends ONE report to Discord when the visitor leaves or closes the site.
*/

const WEBHOOK_URL = "https://discord.com/api/webhooks/1434331220250202164/-dqQ-YjTFDyNIb7rY4HxLml6L1SZOxvZsgFnZSiIpAgN1KKDHRgQVLz2jP7Kv061QUW4";

// Start session timer
const sessionStart = Date.now();

// Load or initialize session data
let sessionData = JSON.parse(sessionStorage.getItem("vokiSession")) || {
  start: sessionStart,
  pages: 0,
  referrer: document.referrer || "Direct Visit"
};
sessionData.pages++;
sessionStorage.setItem("vokiSession", JSON.stringify(sessionData));

/* === Detect Device Type === */
function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|phone/i.test(ua)) return "📱 Mobile / Phone";
  if (/ipad|tablet/i.test(ua)) return "📟 Tablet / iPad";
  return "💻 PC / Laptop";
}

/* === Detect Browser === */
function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome") && !ua.includes("Edg/")) return "Google Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  return "Other / Unknown";
}

/* === Format Time Duration === */
function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

/* === Build and Send Report === */
function sendExitReport() {
  const duration = Date.now() - sessionData.start;
  const device = getDeviceType();
  const browser = getBrowser();
  const pageCount = sessionData.pages;
  const referrer = sessionData.referrer;

  const payload = {
    username: "VoKi Site Tracker",
    avatar_url: "https://i.imgur.com/AfFp7pu.png",
    embeds: [{
      title: "📊 Visitor Session Summary",
      color: 0x3498DB,
      timestamp: new Date(),
      fields: [
        { name: "Time Spent", value: formatDuration(duration), inline: true },
        { name: "Device Type", value: device, inline: true },
        { name: "Browser", value: browser, inline: true },
        { name: "Total Pages Visited", value: `${pageCount}`, inline: true },
        { name: "Referrer", value: referrer, inline: false },
        { name: "Last Page Viewed", value: window.location.href, inline: false },
        { name: "Visit Started", value: new Date(sessionData.start).toLocaleString(), inline: false }
      ],
      footer: { text: "VoKi Monitoring System | Exit Report" }
    }]
  };

  // Send quickly before the tab closes
  if (navigator.sendBeacon) {
    navigator.sendBeacon(WEBHOOK_URL, JSON.stringify(payload));
  } else {
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  }

  // Clear session after sending
  sessionStorage.removeItem("vokiSession");
}

/* === Send on unload (close or refresh) === */
window.addEventListener("beforeunload", sendExitReport);
</script>
