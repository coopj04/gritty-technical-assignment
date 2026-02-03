# Gritty AI Chat (Next.js + TypeScript)

A simple chat-style web app that lets a user send prompts and receive AI responses.

## Loom Demo
- **Demo video:** [Video Link](https://www.loom.com/share/3155be97cc9446ceab743134452622e2)

In the demo, I walk through the UI/UX, API route, how prompts are handled, tradeoffs, and what I’d improve with more time.

---

## Features Implemented

### Core Requirements
- **Prompt UI**
  - Text input for user prompts
  - Submit button
  - Response display area
  - Clear visual distinction between **User** and **AI** messages
- **Form behavior**
  - Prevents empty submissions
  - Shows a loading state while waiting for the AI response
  - Clears the input after submit so the user can immediately type a new prompt
- **TypeScript**
  - Typed UI state and API request/response payloads
- **Backend API route**
  - Next.js API route (`/api/prompt`) receives the prompt and calls the AI provider (OpenAI)
  - API key stored in environment variables

### Bonus Features Added
- **Full chat history (client-side)**
  - Messages are stored in an array and rendered in order (multi-turn UI history)
- **Dark / Light mode toggle**
  - Toggle button switches themes
  - Theme is persisted in `localStorage`
  - Uses a class-based `dark` mode approach
- **Animated typing indicator**
  - While awaiting the AI response, an animated “typing” bubble is shown


---

## Tech Stack
- **Next.js** (App Router)
- **React** (functional components + hooks)
- **TypeScript**
- **Tailwind CSS** (styling + dark mode utilities)
- **OpenAI SDK** (server-side AI requests)

---

## Getting Started

### Prerequisites
- **Node.js >= 20.9.0**
- npm / pnpm / yarn

### 1) Install dependencies
```bash
npm install
