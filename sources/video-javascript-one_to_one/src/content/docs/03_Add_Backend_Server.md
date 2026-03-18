---
title: Connect Backend Server
description: Connect the video application to the backend server
---

Let's get the video application connected to the backend server so that it can get the credentials needed to join a call.

In the `config.js` file in the `js` folder, add your backend server's URL.

```js
const SAMPLE_SERVER_BASE_URL = 'https://YOUR-SERVER-URL';
```
 > Note: Any applications you build may have both the frontend and backend code within the same code base. For this demo, we have separated them so that the backend server could be reused in other exercises.