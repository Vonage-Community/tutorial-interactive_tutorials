const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function ask(question, fallback = "") {
  const answer = await rl.question(fallback ? `${question} (${fallback}): ` : `${question}: `);
  return answer.trim() || fallback;
}

async function readPrivateKey() {
  const source = await ask("Private key file path, or press Enter to paste the private key");

  if (source) {
    return fs.readFile(path.resolve(source), "utf8");
  }

  console.log("Paste the private key. Finish with the line -----END PRIVATE KEY-----");

  const lines = [];
  while (true) {
    const line = await rl.question("");
    lines.push(line);

    if (line.includes("-----END PRIVATE KEY-----")) {
      break;
    }
  }

  return `${lines.join("\n")}\n`;
}

function normalizeRecipient(number) {
  return number.replace(/^\+/, "").replace(/^00/, "");
}

async function main() {
  console.log("\nRCS branded messaging setup\n");

  const applicationId = await ask("Vonage Application ID");
  const rcsSenderId = await ask("RCS Sender ID");
  const toNumber = normalizeRecipient(await ask("RCS recipient phone number"));
  const rcsCategory = await ask("RCS category", "transaction");
  const privateKey = await readPrivateKey();

  const privateKeyPath = path.join(process.cwd(), "private.key");
  await fs.writeFile(privateKeyPath, privateKey, { mode: 0o600 });

  const env = [
    `VONAGE_APPLICATION_ID=${applicationId}`,
    "VONAGE_PRIVATE_KEY_PATH=./private.key",
    `RCS_SENDER_ID=${rcsSenderId}`,
    `RCS_TO_NUMBER=${toNumber}`,
    `RCS_CATEGORY=${rcsCategory}`,
    "MESSAGES_API_URL=https://api.nexmo.com/v1/messages",
    "DEFAULT_RCS_TEXT=Hello from Vonage RCS"
  ].join("\n");

  await fs.writeFile(path.join(process.cwd(), ".env"), `${env}\n`);

  console.log("\nSetup complete. Reload the RCS app in your browser tab.\n");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
