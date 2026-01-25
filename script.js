<script>
(function () {
  // ---- Detect browser ----
  const ua = navigator.userAgent;
  let browser = "Unknown";

  if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
  else if (ua.includes("Chrome") && !ua.includes("Edg/")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

  // ---- Create UI box ----
  const box = document.createElement("div");
  box.id = "time-browser-box";
  box.innerHTML = `
    <div class="tb-title">Session Info</div>
    <div class="tb-row"><span>Browser</span><span id="tb-browser">${browser}</span></div>
    <div class="tb-row"><span>Local Time</span><span id="tb-local">--:--:--</span></div>
    <div class="tb-row"><span>UTC Time</span><span id="tb-utc">--:--:--</span></div>
  `;

  document.body.appendChild(box);

  // ---- Styles ----
  const style = document.createElement("style");
  style.textContent = `
    #time-browser-box {
      position: fixed;
      bottom: 16px;
      left: 16px;
      padding: 14px 18px;
      min-width: 220px;
      background: rgba(20, 24, 40, 0.75);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #fff;
      font-family: system-ui, -apple-system, Segoe UI, Inter, sans-serif;
      font-size: 13px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      z-index: 99999;
      user-select: none;
    }

    #time-browser-box .tb-title {
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 8px;
      letter-spacing: 0.4px;
      opacity: 0.9;
    }

    #time-browser-box .tb-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin: 4px 0;
      opacity: 0.95;
    }

    #time-browser-box .tb-row span:last-child {
      font-weight: 600;
      color: #aeefff;
    }

    @media (max-width: 600px) {
      #time-browser-box {
        font-size: 12px;
        padding: 12px 14px;
        min-width: 190px;
      }
    }
  `;
  document.head.appendChild(style);

  // ---- Time updater ----
  function updateTime() {
    const now = new Date();

    const local = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const utc = now.toUTCString().split(" ")[4];

    const localEl = document.getElementById("tb-local");
    const utcEl = document.getElementById("tb-utc");

    if (localEl) localEl.textContent = local;
    if (utcEl) utcEl.textContent = utc;
  }

  updateTime();
  setInterval(updateTime, 1000);
})();
</script>
