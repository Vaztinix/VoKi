import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMsg = req.body.message || "";
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",  // change model if desired
        prompt: `You are a friendly, motivational AI that helps users debug and understand their Kite.onl setups. ${userMsg}`,
      }),
    });

    const data = await response.text();
    // Ollama streams responses line-by-line, so we take the last JSON line
    const lines = data.trim().split("\n");
    const last = JSON.parse(lines[lines.length - 1]);
    res.json({ reply: last.response || "Sorry, I couldn't generate a response." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "There was an error connecting to the AI." });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

