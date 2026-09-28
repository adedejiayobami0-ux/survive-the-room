# Outsmart

Outsmart is a multiplayer scenario game where players learn by making decisions and seeing the consequences.

## Included game packs

- 🏛️ Could You Survive History? — Pompeii, 79 AD
- 💸 Money Moves — first month living alone
- 🔬 Science Survival — stranded on Mars
- 🔥 Chaos Mode — trapped in IKEA

## Current multiplayer loop

1. Host chooses a pack.
2. Host creates a room.
3. Friends join with a room code.
4. Everyone receives a private role.
5. Each round presents one scenario.
6. Players privately choose an action.
7. Host reveals the consequences.
8. Each result explains *why* the choice mattered.
9. Stats change based on the decision.
10. Final scoreboard appears after the last round.

## Setup

### Supabase

Create a Supabase project.

Enable Anonymous Sign-Ins under Authentication.

Then run:

`supabase/schema.sql`

in the Supabase SQL editor.

### Environment

Copy:

`.env.local.example`

to:

`.env.local`

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not use a service-role key in the browser.

### Install

```bash
npm install
npm run dev
```

Open:

`http://localhost:3000`

Use a normal browser window and an incognito window to test multiplayer locally.

## GitHub

You can keep your current repository and replace the old starter files with these.

You do not need a second repo unless you want to preserve the old Outlast prototype separately.

## Next feature ideas

- more scenarios inside each pack
- difficulty levels
- classrooms / teacher-host mode
- age ranges
- custom scenario builder
- team mode
- evidence/source cards for learning rounds
- rescue/voting mechanics for Chaos Mode
- achievements and streaks
