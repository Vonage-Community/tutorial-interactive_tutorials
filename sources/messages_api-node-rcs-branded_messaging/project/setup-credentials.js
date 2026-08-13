const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const readline = require("node:readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function ask(question, fallback = "") {
  const answer = await rl.question(fallback ? `${question} (${fallback}): ` : `${question}: `);
  return answer.trim() || fallback;
}

function normalizeRecipient(number) {
  return number.replace(/^\+/, "").replace(/^00/, "");
}

function getApplicationUrl() {
  if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    return `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  }

  return "http://localhost:3000";
}

async function main() {
  console.log("\nRCS branded messaging setup\n");
  console.log("Before running this script, add your Vonage private key to project/private.key.\n");

  const applicationId = await ask("Vonage Application ID");
  const rcsSenderId = await ask("RCS Sender ID");
  const toNumber = normalizeRecipient(await ask("RCS recipient phone number"));
  const privateKeyPath = path.join(process.cwd(), "private.key");
  const privateKey = await fs.readFile(privateKeyPath, "utf8");

  try {
    crypto.createPrivateKey(privateKey);
  } catch {
    throw new Error("The private key in project/private.key could not be read. Make sure you include the BEGIN and END lines from the private.key file.");
  }

  const env = [
    `VONAGE_APPLICATION_ID=${applicationId}`,
    "VONAGE_PRIVATE_KEY_PATH=./private.key",
    `RCS_SENDER_ID=${rcsSenderId}`,
    `RCS_TO_NUMBER=${toNumber}`,
    "RCS_CATEGORY=transaction",
    "MESSAGES_API_URL=https://api.nexmo.com/v1/messages",
    "DEFAULT_RCS_TEXT=Hello from Vonage RCS"
  ].join("\n");

  await fs.writeFile(path.join(process.cwd(), ".env"), `${env}\n`);

  console.log("\nSetup complete. Reload the RCS app in your browser tab.");
  console.log(`Application URL: ${getApplicationUrl()}\n`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
