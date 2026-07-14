---
title: Make a Call
description: Creating the server so we can interact with the Agent.
---
Now that we have the Agent created and a server that will allow Vonage to make the connection, it's time to make a call!

If you do not see the phone number that was purchased during the setup phase in the beginning in the terminal, you can find it in the `.env` file under `VONAGE_PHONE_NUMBER`.

Make a call to the phone number and ask Leonardo da Vinci some questions.

Did it work?

Yes? Congrats!!

Was the phone line busy? That means Vonage was unable to reach the Answer WebHook. Double check that the server's port (3000) is running (green dot) and Public under the `PORTS` tab next to `TERMINAL`.