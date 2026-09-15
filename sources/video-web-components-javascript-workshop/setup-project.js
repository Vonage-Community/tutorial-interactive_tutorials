import 'dotenv/config';
import fs from 'fs';
import { Vonage } from '@vonage/server-sdk';

let vonage;

const PORT = '3000';

console.log('setup.js running...');
if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
    // If the environment variables are already set, use them
    console.log('Environment variables already set. Skipping setup.');
    process.exit();
}

let step = 'SET_API_KEY';
console.log('Vonage setup utility for Github Codespaces -- press "q" to exit');
console.log('This utility will need your Vonage API key and API secret. They will be saved to your .env file,');
console.log('where they will be visible only to you and collaborators on this project.');
console.log('Find your API key and secret at: https://dashboard.vonage.com/getting-started-guide');
console.log('Enter your Vonage API Key:');
let input = process.stdin;
input.on('data', data => {
    const inputStr = data.toString().trim();

    if (inputStr === 'q') {
        return process.exit();
    }

    switch (step) {
        case 'SET_API_KEY':
            return setApiKey(inputStr);
        case 'SET_API_SECRET':
            return setApiSecret(inputStr);
        case 'SET_FAL_API_KEY':
            return setFalApiKey(inputStr);
        case 'SET_APP_NAME':
            return setAppName(inputStr);
        default:
    }
});

function setApiKey(data) {
    if (!data) {
        console.log('(Can not be blank.) Enter your Vonage API key:');
    } else {
        process.env.VONAGE_API_KEY = data
        step = 'SET_API_SECRET';
        console.log('Enter your Vonage API secret:');
    }
}

function setApiSecret(data) {
    if (!data) {
        console.log('(Can not be blank.) Enter your Vonage API secret:');
    } else {
        process.env.VONAGE_API_SECRET = data;
        step = 'SET_FAL_API_KEY';
        console.log('Enter your fal API Key:');
    }
}

function setFalApiKey(data) {
    if (!data) {
        console.log('(Can not be blank.) Enter your fal API key:');
    } else {
        process.env.FAL_KEY = data;
        step = 'SET_APP_NAME';
        console.log('Enter a name for your Application (e.g., Hackathon-Video-App):');
    }
}


function setAppName(data) {
    if (!data) {
        console.log('(Can not be blank.) Enter a name for your Application (e.g., Hackathon-Video-App):');
    } else {
        process.env.VONAGE_APPLICATION_NAME = data;
        createApp(data);
    }
}


function createApp(appName) {
    console.log('Creating your Application...');
    vonage = new Vonage({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET
    }, {
        debug: false
    });

    vonage.applications.createApplication({
        name: appName,
        capabilities: {
            video: {
                webhooks: {
                    archive_status: {
                        address: `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev/api/archive/status`,
                        http_method: "POST"
                    }
                }
            }
        }
    }).then((app) => {
        console.log('Application created with ID: ', app.id);
        process.env.VONAGE_APPLICATION_ID = app.id;
        process.env.VONAGE_PRIVATE_KEY = app.keys.private_key;
        fs.writeFile(import.meta.dirname + '/private.key', app.keys.private_key, (err) => {
            if (err) {
                console.log('Error writing private key: ', err);
            } else {
                console.log('Private key saved to private.key');
                try {
                    // convert private.key to base64
                    console.log('Converting private key to base64...');
                    const privateKey = fs.readFileSync(import.meta.dirname + '/private.key');
                    const base64PrivateKey = privateKey.toString('base64');
                    process.env.VONAGE_PRIVATE_KEY64 = base64PrivateKey;

                    console.log('private key converted to base64');

                    writeEnv();

                } catch (error) {
                    console.error('An error occurred:', error);
                }


            }
        });
    }).catch((error) => {
        console.error('Error creating Application: ', error);
        process.exit();
    });
}

function writeEnv() {
    const formattedPrivateKey = process.env.VONAGE_PRIVATE_KEY.replace(/\n/g, '\\n');
    const contents = `VONAGE_API_KEY="${process.env.VONAGE_API_KEY}"
VONAGE_API_SECRET="${process.env.VONAGE_API_SECRET}"
VONAGE_APPLICATION_NAME="${process.env.VONAGE_APPLICATION_NAME}"
VONAGE_APPLICATION_ID="${process.env.VONAGE_APPLICATION_ID}"
VONAGE_PRIVATE_KEY="${formattedPrivateKey}"
VONAGE_PRIVATE_KEY64="${process.env.VONAGE_PRIVATE_KEY64}"
FAL_KEY="${process.env.FAL_KEY}"
CODESPACE_URL="https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev"
`;

    fs.writeFile(import.meta.dirname + '/.env', contents, (err) => {
        if (err) {
            console.log('Error writing .env file: ', err);
        } else {
            console.log('\n✅ Setup Complete! Environment variables saved to .env');
            console.log('\nRun "npm start" to start your server if not already running.');
            process.exit();
        }
    });

}
