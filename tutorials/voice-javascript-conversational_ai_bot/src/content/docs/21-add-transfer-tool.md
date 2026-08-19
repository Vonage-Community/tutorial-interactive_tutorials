---
title: Add Transfer Tool
description: Define the OpenAI tool used to detect when the caller asks for a person.
---

# Add Transfer Tool

OpenAI tool calling lets the model return a structured signal instead of normal text when it detects a transfer request.

Add this code directly after the transfer number constants:

```js
const tools = [
  {
    type: 'function',
    function: {
      name: 'connect_to_human',
      description: 'Call this when the caller wants to speak to a real person or a human agent.',
      parameters: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    }
  }
];
```

The tool has no arguments. It only tells your application that the caller wants to leave the bot flow and speak to a person.
