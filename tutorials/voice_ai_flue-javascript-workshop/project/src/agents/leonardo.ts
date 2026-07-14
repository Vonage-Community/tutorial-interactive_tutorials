import { defineAgent, type AgentRouteHandler } from '@flue/runtime';

// ⌄⌄⌄ Description of the Agent to be used when in a list ⌄⌄⌄

// ⌄⌄⌄ Create a route so that we can interact via HTTP ⌄⌄⌄

// google/gemma-4-26b-a4b-it google/gemini-2.5-flash google/gemini-3.5-flash
export default defineAgent(() => ({
  model: 'google/gemini-2.5-flash',

  // ⌄⌄⌄ Define the Leonardo da Vinci Agent ⌄⌄⌄

}));
