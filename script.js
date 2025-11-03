<script>
// Run immediately on page load
(function() {
    // Detect browser
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    if (userAgent.includes("Edg/")) browser = "Microsoft Edge";
    else if (userAgent.includes("Chrome") && !userAgent.includes("Edg/")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
    else if (userAgent.includes("OPR") || userAgent.includes("Opera")) browser = "Opera";

    // Detect device type
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
        ? "Mobile / Tablet"
        : "PC / Laptop";

    // Optional: detect referrer
    const referrer = document.referrer || "Direct";

    // Display info or use it immediately (no saving)
    console.log("Visitor info:", {
        browser: browser,
        device: deviceType,
        referrer: referrer,
        page: window.location.href
    });

    // Example: show info to user
    const infoDiv = document.createElement("div");
    infoDiv.style.position = "fixed";
    infoDiv.style.bottom = "10px";
    infoDiv.style.right = "10px";
    infoDiv.style.padding = "8px 12px";
    infoDiv.style.background = "rgba(0,0,0,0.7)";
    infoDiv.style.color = "white";
    infoDiv.style.fontSize = "14px";
    infoDiv.style.borderRadius = "8px";
    infoDiv.style.zIndex = 9999;
    infoDiv.textContent = `Browser: ${browser} | Device: ${deviceType}`;
    document.body.appendChild(infoDiv);

})();
</script>
