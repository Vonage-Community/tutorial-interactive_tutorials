---
title: Add Gemini API Key
description: Generate the Google Gemini API Key.
---

For this application, we will be using Google's AI model, Gemini as the "brain" of our application. We will need an API Key to gain access to the model.

Go to <a href="https://aistudio.google.com/api-keys" target="_blank">Google AI Studio API Keys page</a>.

Click the `Create API Key` button in upper right corner.

You can leave the name of your Key as `Gemini API Key`. 

For `Choose an imported project`, select `Create Project`.

Name your project as
```html
GDG x Vonage workshop
```

Once the `API Key details` modal pops up, click `Copy key`.

Open the `.env` file and paste the API Key as the value for `GEMINI_API_KEY`.

Now we've got all the setup completed, we can start building our application.