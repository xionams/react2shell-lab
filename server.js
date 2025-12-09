const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// "מסד נתונים" בזיכרון
let messages = [
  {
    id: 1,
    author: "system",
    content: "Welcome to the vulnerable React chat 👋"
  }
];

app.use(cors());
app.use(bodyParser.json());

// סטטי ל־index.html
app.use(express.static(path.join(__dirname, "public")));

// API להודעות
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { author, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "content is required" });
  }

  const msg = {
    id: messages.length + 1,
    author: author || "anon",
    content
  };

  messages.push(msg);
  res.status(201).json(msg);
});

// --------- נקודת RCE פגיעה בכוונה ---------
// אל תעשה דבר כזה לעולם בקוד אמיתי
app.get("/api/exec", (req, res) => {
  const cmd = req.query.cmd;

  if (!cmd) {
    return res.status(400).send("Query param 'cmd' is required");
  }

  console.log("[!] Executing command from /api/exec:", cmd);

  exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
    if (err) {
      return res
        .status(500)
        .type("text/plain")
        .send("Error: " + err.message);
    }

    const out = stdout || stderr || "(no output)";
    res.type("text/plain").send(out);
  });
});
// -------------------------------------------

app.listen(PORT, () => {
  console.log(`Vulnerable lab listening on http://localhost:${PORT}`);
});
