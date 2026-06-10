---
title: Configure Environment
---

# Configure Environment Variables

The application uses environment variables for configuration. In this step, you will create the `.env` files and fill in your Vonage credentials.

From the root of the project directory, run:

```sh
cp backend/.env.example backend/.env
```

This creates environment files for both the backend based on the provided examples.

{% filetree %}

- backend/
  - .env.example
  - .env

{% /filetree %}

## Fill in the Backend Configuration

Open `backend/.env` in your editor and set the following values:

```sh
VONAGE_APP_ID=your-application-id
VONAGE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
```

- **VONAGE_APP_ID** — The Application ID from the [Applications page](https://dashboard.vonage.com/applications) in the Vonage Dashboard.
- **VONAGE_PRIVATE_KEY** — The content of the private key file you downloaded when creating the application.

{% aside type="tip" %}
You can find your Application ID on the Applications page of the Vonage Dashboard. It's displayed at the top of the application details view.
{% /aside %}

{% aside type="caution" %}
Never commit your `.env` files or private key to source control. The `.gitignore` file in the project should already exclude these, but always double-check.
{% /aside %}

Your environment is now configured. In the next step, you'll start the application.
