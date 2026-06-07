import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { Vonage } from "@vonage/server-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || process.env.NERU_APP_PORT || 3000);
const ENV_PATH = path.join(__dirname, ".env");

const rl = readline.createInterface({ input, output });

try {
  console.log("Vonage Advanced Video setup");
  console.log("This stores credentials in the local .env file for this Codespace.");
  console.log("Find your account API key and account API secret at https://dashboard.vonage.com/settings");
  console.log("Do not paste an Application ID, private key, JWT secret, or signature secret here.");
  console.log("Setup will create a new Vonage Video application in your dashboard automatically.");
  console.log("");

  const apiKey = await prompt("Vonage account API key", process.env.VONAGE_API_KEY);
  const apiSecret = await prompt("Vonage account API secret", process.env.VONAGE_API_SECRET);

  if (!apiKey || !apiSecret) {
    throw new Error("API key and API secret are required.");
  }

  const appUrl = getAppUrl();
  const callbackUrl = `${appUrl}/callbacks/video`;
  const applicationName = `Advanced Video Exercises - ${process.env.CODESPACE_NAME || "local"}`;
  const vonage = new Vonage({ apiKey, apiSecret });

  console.log("");
  console.log(`Creating a new Vonage Video application: ${applicationName}`);
  const application = await vonage.applications.createApplication({
    name: applicationName,
    capabilities: {
      rtc: {
        webhooks: {
          event_url: {
            address: callbackUrl,
            http_method: "POST"
          }
        }
      }
    }
  });

  const privateKey = application.keys.private_key;
  if (!application.id || !privateKey) {
    throw new Error("Vonage did not return an application ID and private key.");
  }

  await writeEnvFile({
    VONAGE_API_KEY: apiKey,
    VONAGE_API_SECRET: apiSecret,
    VONAGE_APPLICATION_ID: application.id,
    VONAGE_PRIVATE_KEY64: Buffer.from(privateKey, "utf8").toString("base64"),
    APP_URL: appUrl,
    VIDEO_CALLBACK_URL: callbackUrl
  });

  console.log("");
  console.log("Setup complete");
  console.log(`Application URL: ${appUrl}`);
  console.log(`Video callback URL: ${callbackUrl}`);
} finally {
  rl.close();
}

async function prompt(label, existingValue) {
  if (existingValue) {
    return existingValue.trim();
  }

  return (await rl.question(`${label}: `)).trim();
}

function getAppUrl() {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }

  if (process.env.CODESPACE_NAME) {
    return `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`;
  }

  return `http://localhost:${PORT}`;
}

async function writeEnvFile(values) {
  const env = Object.entries(values)
    .map(([key, value]) => `${key}="${quoteEnvValue(value)}"`)
    .join("\n");

  await fs.writeFile(ENV_PATH, `${env}\n`, "utf8");
}

function quoteEnvValue(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}
