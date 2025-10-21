import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Replace with a real AI API endpoint (OpenAI, Anthropic, etc.)
const AI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.OPENAI_API_KEY;

app.post("/chat", async (req, res) => {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an assistant that answers questions about kite.onl." },
          { role: "user", content: req.body.message }
        ]
      })
    });
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("AI backend running on http://localhost:3000"));

