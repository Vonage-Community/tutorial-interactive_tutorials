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

function getApplicationUrl() {
  if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    return `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  }
  return "http://localhost:3000";
}

async function main() {
  console.log("\nSMS delivery status setup\n");
  console.log("Before running this script, paste your full Vonage private key into project/private.key.\n");

  const applicationId = await ask("Vonage Application ID");
  const fromNumber = normalizePhoneNumber(await ask("Linked Vonage SMS number"));
  const toNumber = normalizePhoneNumber(await ask("SMS recipient phone number"));
  const privateKeyPath = path.join(process.cwd(), "private.key");
  const privateKey = await fs.readFile(privateKeyPath, "utf8");

  try {
    crypto.createPrivateKey(privateKey);
  } catch {
    throw new Error("The private key in project/private.key could not be read. Include the BEGIN and END lines exactly once.");
  }

  if (!applicationId || !fromNumber || !toNumber) {
    throw new Error("Application ID, sender number, and recipient number are required.");
  }

  const env = [
    `VONAGE_APPLICATION_ID=${applicationId}`,
    "VONAGE_PRIVATE_KEY_PATH=./private.key",
    `SMS_FROM_NUMBER=${fromNumber}`,
    `SMS_TO_NUMBER=${toNumber}`,
    "MESSAGES_API_HOST=https://api.nexmo.com",
    "DEFAULT_SMS_TEXT=Track this SMS with a status callback"
  ].join("\n");

  await fs.writeFile(path.join(process.cwd(), ".env"), `${env}\n`);

  const applicationUrl = getApplicationUrl();
  console.log("\nSetup complete. Reload the SMS Status Monitor in your browser tab.");
  console.log(`Application URL: ${applicationUrl}`);
  console.log(`Status webhook URL: ${applicationUrl}/webhooks/status\n`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
