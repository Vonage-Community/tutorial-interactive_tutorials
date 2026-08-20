require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { Vonage } = require('@vonage/server-sdk');

let vonage;

const PORT = '3000';

console.log('setup.js running...');

// 1. Grab the active attendee's username directly from the Codespace environment variables
const currentUser = process.env.GITHUB_USER;
// 2. Define the hardcoded repository name matching your export script
const repoName = "createher-vonage-webxr-workshop";

function configureReadme() {
  console.log("⚙️ Automatically pre-configuring your Codespaces README shortcut...");


  if (!currentUser) {
    console.error("❌ Error: GITHUB_USER environment variable not found. Are you running this inside a Codespace?");
    return;
  }


  const fullRepoPath = `${currentUser}/${repoName}`;

  // 3. Resolve the path to your README.md file
  const readmePath = path.resolve('./README.md');

  if (!fs.existsSync(readmePath)) {
    console.error(`❌ Error: README.md not found at ${readmePath}`);
    return;
  }

  // 4. Read the file, swap out the placeholder text, and write it back
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // This replaces TARGET_REPO_PLACEHOLDER with the user/repo string
  const updatedContent = readmeContent.replace(/TARGET_REPO_PLACEHOLDER/g, fullRepoPath);

  fs.writeFileSync(readmePath, updatedContent, 'utf8');
  console.log(`✅ Success! README.md configured for: ${fullRepoPath}`);
}

configureReadme();


if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
  // If the environment variables are already set, use them
  console.log('Environment variables already set. Skipping setup.');
  process.exit();
}

let step = 'SET_API_KEY';
console.log('Vonage setup utility for Github Codespaces -- press "q" to exit');
console.log(
  'This utility will need your Vonage API key and API secret. They will be saved to your .env file,'
);
console.log(
  'where they will be visible only to you and collaborators on this project.'
);
console.log(
  'Find your API key and secret at: https://dashboard.vonage.com/getting-started-guide'
);
console.log('process.env.CODESPACE_NAME: ', process.env.CODESPACE_NAME);
console.log('Enter your API Key:');
let input = process.stdin;
input.on('data', (data) => {
  if (data.toString().trim() === 'q') {
    // exit
    return process.exit();
  }

  switch (step) {
    case 'SET_API_KEY':
      return setApiKey(data);
      break;
    case 'SET_API_SECRET':
      return setApiSecret(data);
      break;
    case 'SET_APP_NAME':
      return setAppName(data);
      break;
    case 'BUY_NUMBER':
      return buyNumberQuestion(data);
      break;
    case 'SET_COUNTRY_CODE':
      return setCountryCode(data);
      break;
    case 'ENTER_PHONE_NUMBER':
      return updatePhoneNumber(data);
      break;
    default:
  }
});

function setApiKey(data) {
  if (
    data.toString().replace(/\n/g, '').length === 0 ||
    data.toString().replace(/\n/g, '') === ' '
  ) {
    console.log('(Can not be blank.) Enter your API key:');
  } else {
    process.env.VONAGE_API_KEY = data.toString().replace(/\n/g, '');
    step = 'SET_API_SECRET';
    console.log('Enter your API secret:');
  }
  return true;
}

function setApiSecret(data) {
  if (
    data.toString().replace(/\n/g, '').length === 0 ||
    data.toString().replace(/\n/g, '') === ' '
  ) {
    console.log('(Can not be blank.) Enter your API secret:');
  } else {
    process.env.VONAGE_API_SECRET = data.toString().replace(/\n/g, '');
    step = 'SET_APP_NAME';
    console.log('Enter a name for your Application:');
  }
  return true;
}

function setAppName(data) {
  if (
    data.toString().replace(/\n/g, '').length === 0 ||
    data.toString().replace(/\n/g, '') === ' '
  ) {
    console.log('(Can not be blank.) Enter a name for your Application:');
  } else {
    createApp(data);
  }
  return true;
}

function buyNumberQuestion(data) {
  // console.log("data:", data);
  if (
    data.toString().replace(/\n/g, '').length === 0 ||
    data.toString().replace(/\n/g, '') === ' '
  ) {
    console.log('(Can not be blank.) Want to Buy a number? (Y/N):');
  } else if (data.toString().replace(/\n/g, '').toLowerCase() === 'y') {
    //   process.env.VONAGE_API_SECRET = data.toString().replace(/\n/g, '');
    step = 'SET_COUNTRY_CODE';
    console.log('Set the country code for your number (ex. US or GB):');
  } else if (data.toString().replace(/\n/g, '').toLowerCase() === 'n') {
    // answered No to question
    writeEnv();
  }
  return true;
}

function setCountryCode(data) {
  if (
    data.toString().replace(/\n/g, '').length === 0 ||
    data.toString().replace(/\n/g, '') === ' '
  ) {
    console.log(
      '(Can not be blank.) Set the country code for your number (ex. US or GB):'
    );
  } else {
    buyPhoneNumber(data);
  }
  return true;
}

function buyPhoneNumber(data) {
  const countryCode = data.toString().replace(/\n/g, '');
  process.env.COUNTRY_CODE = data.toString().replace(/\n/g, '').toUpperCase();
  //Search for a number
  console.log('Searching for a number in country: ', countryCode);
  vonage.numbers
    .getAvailableNumbers({
      country: process.env.COUNTRY_CODE,
      features: ['VOICE', 'SMS'],
    })
    .then((results) => {
      const numbers = results.numbers;
      console.log('Found numbers: ', numbers);
      // Purchase a number
      if (numbers.length === 0) {
        console.log(
          'No numbers found in this country. Please try another country code.'
        );
        return;
      }
      console.log('Found a number: ', numbers[0].msisdn);
      vonage.numbers
        .buyNumber({
          country: numbers[0].country,
          msisdn: numbers[0].msisdn,
        })
        .then((result) => {
          console.log('Bought the number!');
          updatePhoneNumber(numbers[0]);
        })
        .catch((error) => {
          console.error('Error buying number:', error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
}

async function updatePhoneNumber(number) {
  console.log('Adding phone number to application...');
  const options = {
    country: process.env.COUNTRY_CODE,
    msisdn: number.msisdn,
    appId: process.env.API_APPLICATION_ID,
  };

  const resp = await vonage.numbers.updateNumber(options);
  if (resp.errorCode !== '200') {
    console.error(`Error: ${resp.errorCodeLabel}`);
  } else {
    console.log('Added number to application!');
    process.env.VONAGE_PHONE_NUMBER = number.msisdn;
    // writeEnv();
    sanitizeWorkshopEnvironment();
  }
}

function createApp(data) {
  console.log('Creating your Application...');
  vonage = new Vonage(
    {
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
    },
    {
      debug: false,
    }
  );

  vonage.applications
    .createApplication({
      name: data.toString().replace(/\n/g, ''),
      capabilities: {
        voice: {
          webhooks: {
            answer_url: {
              address: `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev/voice/answer`,
              http_method: 'GET',
            },
            event_url: {
              address: `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev/voice/event`,
              http_method: 'POST',
            },
          },
        },
        messages: {
          webhooks: {
            inbound_url: {
              address: `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev/webhooks/inbound`,
              http_method: 'POST',
            },
            status_url: {
              address: `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev/webhooks/status`,
              http_method: 'POST',
            },
          },
        },
        rtc: {
          webhooks: {
            event_url: {
              address: `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev/webhooks/rtcevent`,
              http_method: 'POST',
            },
          },
        },
      },
    })
    .then((app) => {
      console.log('Application created with ID: ', app.id);
      process.env.API_APPLICATION_ID = app.id;
      fs.writeFile(__dirname + '/private.key', app.keys.private_key, (err) => {
        if (err) {
          console.log('Error writing private key: ', err);
        } else {
          console.log('Private key saved to private.key');
          try {
            // convert private.key to base64
            console.log('Converting private key to base64...');
            const privateKey = fs.readFileSync(__dirname + '/private.key');
            const base64PrivateKey = privateKey.toString('base64');
            process.env.PRIVATE_KEY64 = base64PrivateKey;

            //Search and Buy phone number
            process.env.VONAGE_APPLICATION_NAME = data
              .toString()
              .replace(/\n/g, '');
            step = 'BUY_NUMBER';
            console.log('Want to Buy a number? (Y/N):');
          } catch (error) {
            console.error('An error occurred:', error);
          }
        }
      });
    })
    .catch((error) => {
      console.error('Error creating Application: ', error);
      process.exit();
    });
  return true;
}

function writeEnv() {
  const contents = `ADMIN_NAME="${process.env.ADMIN_NAME}"
ADMIN_PASSWORD="${process.env.ADMIN_PASSWORD}"
VONAGE_API_KEY="${process.env.VONAGE_API_KEY}"
VONAGE_API_SECRET="${process.env.VONAGE_API_SECRET}"
VONAGE_APPLICATION_NAME="${process.env.VONAGE_APPLICATION_NAME}"
API_APPLICATION_ID="${process.env.API_APPLICATION_ID}"
COUNTRY_CODE="${process.env.COUNTRY_CODE}"
VONAGE_PHONE_NUMBER="${process.env.VONAGE_PHONE_NUMBER}"
PRIVATE_KEY64="${process.env.PRIVATE_KEY64}"
EXPORT_GITHUB_USER="${currentUser}"
EXPORT_REPO_NAME="${repoName}"
`;

  fs.writeFile(__dirname + '/.env', contents, (err) => {
    if (err) {
      console.log('Error writing .env file: ', err);
    } else {
      console.log('Environment variables saved to .env');
      process.exit();
    }
  });
}

function createUser() {
  //create user
  const vonage = new Vonage(
    {
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      applicationId: process.env.API_APPLICATION_ID,
      privateKey: __dirname + process.env.PRIVATE_KEY,
    },
    { debug: false }
  );
  vonage.users.create(
    {
      name: process.env.ADMIN_NAME,
      display_name: process.env.ADMIN_NAME,
    },
    (err, response) => {
      if (err) {
        console.log('Error creating user: ', err);
      } else {
        console.log('User created. ID: ', response.id);
        process.exit();
      }
    }
  );
}

// Allow coding exercise to be exported to user's GitHub account
function sanitizeWorkshopEnvironment() {
  // Look for the parent git directory (one level up from the 'project' CWD)
  const parentGitPath = path.join(__dirname, '../.git');
  const projectGitPath = path.join(__dirname, '.git');

  try {
    // 1. Remove any accidentally created git tracker inside the project folder
    if (fs.existsSync(projectGitPath)) {
      fs.rmSync(projectGitPath, { recursive: true, force: true });
      console.log('Cleared local .git directory to ensure a clean slate.');
    }

    // 2. Sever the tie with your main multi-workshop repository
    if (fs.existsSync(parentGitPath)) {
      // Renaming it prevents Git from looking upwards for tracking configurations,
      // while preserving your workshop configuration integrity.
      const backupPath = path.join(__dirname, '../.git_bak');
      if (!fs.existsSync(backupPath)) {
        fs.renameSync(parentGitPath, backupPath);
        console.log(
          'Successfully separated current workspace from the main repository tracking.'
        );
      }
    }
    // process.exit();
    writeEnv();
  } catch (error) {
    console.error(
      'Warning: Failed to safely disconnect parent repository framework:',
      error.message
    );
  }
}
