const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const VONAGE_APPLICATION = process.env.VONAGE_APPLICATION_ID;

const capabilities = <CAPABILITIES>;

if (capabilities) {
    console.log(`Enabling ${capabilities}`);
    
    // Fetch the application JSON
    const response = await fetch(`https://api.nexmo.com/v2/applications/${VONAGE_APPLICATION}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${VONAGE_API_KEY}:${VONAGE_API_SECRET}`).toString('base64')}`
        }
    });

    const data = await response.json();

    // Ensure the capabilities object exists and update it

    const capabilitiesObject = {};
    capabilities.forEach(capability => {
        if (capability === "voice") {
            capabilitiesObject.voice = {};
        }
    });

    const updatedData = {
        ...data,
        capabilities: capabilitiesObject
    };

    // Send the updated JSON back
    const updateResponse = await fetch(`https://api.nexmo.com/v2/applications/${VONAGE_APPLICATION}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${VONAGE_API_KEY}:${VONAGE_API_SECRET}`).toString('base64')}`
        },
        body: JSON.stringify(updatedData)
    });

    if (updateResponse.ok) {
        console.log('Successfully updated the application.');
    } else {
        console.error('Failed to update the application.');
    }
} else {
    console.log('No Capabilities, skipping.');
}
