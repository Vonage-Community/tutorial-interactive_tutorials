const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const readline = require("node:readline/promises");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function ask(question) {
  return (await rl.question(`${question}: `)).trim();
}

function normalizePhoneNumber(number) {
  return number.replace(/^\+/, "").replace(/^00/, "").replace(/[\s()-]/g, "");
}

function normalizeSenderId(senderId) {
  const value = senderId.trim();
  return /^(?:\+|00|\d)/.test(value) ? normalizePhoneNumber(value) : value;
}

function getApplicationUrl() {
  if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    return `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  }
  return "http://localhost:3000";
}

async function main() {
  console.log("\nSMS exercise setup\n");
  console.log("Before running this script, paste your full Vonage private key into project/private.key.\n");

  const privateKeyPath = path.join(process.cwd(), "private.key");
  let privateKey;

  try {
    privateKey = await fs.readFile(privateKeyPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("Open project/private.key, paste your complete Vonage private key, and save the file before running setup.");
    }
    throw error;
  }

  try {
    crypto.createPrivateKey(privateKey);
  } catch {
    throw new Error("The private key in project/private.key could not be read. Include the BEGIN and END lines exactly once.");
  }

  const applicationId = await ask("Vonage Application ID");
  const senderId = normalizeSenderId(await ask("SMS Sender ID (brand name or SMS-capable number)"));
  const toNumber = normalizePhoneNumber(await ask("SMS recipient phone number (country code and number)"));

  if (!applicationId || !senderId || !toNumber) {
    throw new Error("Application ID, SMS Sender ID, and recipient number are required.");
  }
  if (!/^\d{7,15}$/.test(toNumber)) {
    throw new Error("Enter the recipient number in E.164 format using 7 to 15 digits, including the country code.");
  }

  const env = [
    `VONAGE_APPLICATION_ID=${applicationId}`,
    "VONAGE_PRIVATE_KEY_PATH=./private.key",
    `SMS_SENDER_ID=${senderId}`,
    `SMS_TO_NUMBER=${toNumber}`,
    "MESSAGES_API_HOST=https://api.nexmo.com",
    "DEFAULT_SMS_TEXT=Hello from the Vonage Messages API"
  ].join("\n");

  await fs.writeFile(path.join(process.cwd(), ".env"), `${env}\n`);

  console.log("\nSetup complete. Reload the SMS Message App in your browser tab.");
  console.log(`Application URL: ${getApplicationUrl()}\n`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
