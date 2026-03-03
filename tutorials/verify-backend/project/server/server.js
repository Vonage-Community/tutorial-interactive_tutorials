require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { Auth } = require("@vonage/auth");
const { Verify2 } = require("@vonage/verify2");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vonage auth
const credentials = new Auth({
  applicationId: process.env.VONAGE_APP_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});

const verifyClient = new Verify2(credentials);

function requireFields(obj, fields) {
  for (const f of fields) {
    if (!obj || obj[f] == null || obj[f] === "") return f;
  }
  return null;
}

app.get("/", (req, res) => {
  res.send("Vonage Verify backend is running.");
});

app.post("/verification", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["phone"]);
    if (missing)
      return res.status(400).json({ error: `Field '${missing}' is required.` });

    const { phone } = req.body || null;
    console.log("Received verification request:", phone);

    const result = await verifyClient.newRequest({
      brand: "DemoApp",
      workflow: [
        { channel: "silent_auth", to: phone },
        { channel: "sms", to: phone },
      ],
    });

    console.log("Verify2 newRequest result:", result);

    return res.json({
      request_id: result.requestId,
      check_url: result.checkUrl,
    });
  } catch (error) {
    console.dir(error, { depth: null, colors: true });
    return res.status(500).json({ error: error.message });
  }
});

app.post("/callback", async (req, res) => {
  console.log(
    "\n-- Callback --\n" + JSON.stringify(req.body, null, 2) + "\n--------\n",
  );
  const { request_id, status } = req.body;
  return res.status(200).json({ status: status });
});

app.post("/check-code", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["request_id", "code"]);
    if (missing)
      return res.status(400).json({ error: `Field '${missing}' is required.` });

    const { request_id, code } = req.body;

    console.log("Checking code for request:", request_id);

    const result = await verifyClient.checkCode(request_id, code);
    console.log("Verify2 checkCode result:", result);

    const verified = result === "completed";

    return res.json({ verified, status: result || null });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/next", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["requestId"]);
    if (missing)
      return res.status(400).json({ error: `Field '${missing}' is required.` });

    const { requestId } = req.body || null;

    // Verify Next workflow
    console.log("Moving to the next channel:", requestId);
    const result = await verifyClient.nextWorkflow(requestId);
    console.log("Result: ", result);

    return res.status(200).json();
  } catch (error) {
    console.dir(error, { depth: null, colors: true });
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
