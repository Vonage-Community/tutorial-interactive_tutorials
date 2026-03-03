# Android Number Verification Client
 
This Android application serves as a client for a Node.js backend that
integrates with Vonage's Number Verification API. The app demonstrates a
complete flow where a user inputs their phone number, requests a login URL, and
performs number verification.

## Features

- Uses **Compose** for a modern, declarative UI.
- Interacts with a Node.js backend to generate a login URL and perform OAuth authentication.
- Verifies the phone number using the **Vonage SDK**.
- Displays real-time status updates and error handling.
- Built with **Kotlin** and utilizes modern libraries such as **OkHttp** and **Kotlin Coroutines**.

## Dependencies

- **OkHttp**: For making HTTP requests.
- **Kotlin Coroutines**: For asynchronous programming.
- **Jetpack Compose**: For UI.

## Building the App

1. Open the project in **Android Studio**.

2. Configure global variables. Create a file named `local.properties` in the root folder of the `client` project (the same directory where the `app/` folder and `build.gradle.kts` are located) with the following content:

```
# Backend base URL
BACKEND_URL=https://your-backend.example.com

# Your phone number (in international format)
PHONE_NUMBER=+44123456789
```

3. Sync Gradle to download dependencies.

4. Connect an Android device or start an emulator.

5. Build and run the app by clicking the **Run** button.


## Usage 

1. Make sure the Node.js backend for this app is running. 
2. Connect your phone and launch the app using Android Studio.
3. Tap the **Login** button in the app.
4. The verification result (success or failure) will be displayed on the screen.


## Troubleshooting

1. **Error: HTTP 400/500 from the Backend**
   - Ensure the backend is running and accessible at the `BACKEND_URL`.

2. **Build Issues**
   - Sync Gradle and ensure all dependencies are downloaded.


