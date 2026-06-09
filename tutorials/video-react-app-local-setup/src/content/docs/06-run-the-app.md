---
title: Run the App
---

# Run the App in Development Mode

With everything configured, you can now start the application locally.

From the project root, run:

```sh
yarn dev
```

This single command starts both:

- The **backend server** on port `3345`
- The **frontend Vite dev server** on port `5173`

Once both servers are running, open your browser and navigate to:

```
http://localhost:5173
```

{% aside type="tip" %}
The frontend dev server supports hot module replacement (HMR), so any changes you make to the React code will be reflected immediately in the browser without a full page reload.
{% /aside %}

{% aside %}
If port 5173 or 3345 is already in use on your machine, check the terminal output for the actual ports being used.
{% /aside %}

You now have the Vonage Video React App running locally and ready for development!
