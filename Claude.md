# CLAUDE.md — TubeVault Frontend

## Project Overview
TubeVault is a consumer-facing AI search platform that makes YouTube channels searchable by meaning. Users ask questions and get answers from creator videos with exact timestamps and direct YouTube links.

TubeVault is the FRONTEND only. The backend is MindVaultAPI (separate project, already running).

## Architecture
- **TubeVault (this project):** Next.js 14 consumer frontend with auth, payments, chat UI
- **MindVaultAPI (separate):** FastAPI + Qdrant backend running at mindvault.ikigai-dynamics.com
- **MindVault (separate):** Streamlit admin panel for ingestion at admin.mindvault.ikigai-dynamics.com
- TubeVault calls MindVaultAPI's endpoints for all search/chat/transcript functionality
- TubeVault NEVER talks to MindVault (admin) directly

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase (auth + user data)
- Stripe (subscriptions)
- Lucide React (icons)

## Brand Identity — IkigAI Dynamics
All UI must use these exact colors (from ikigai-dynamics.com):
- Primary green: #65ae4c
- Primary green hover: #7bc361
- Primary green dark: #4B6442
- Dark background: #1d1d1d
- Darker background: #151515
- Surface/card: #2a2a2a
- Cream text: #f9f9f9
- Gray text: #9e9e9e
- Input fields: bg-white/5 border-gray-700

Font: Inter (Google Fonts)

## MindVaultAPI Backend — Existing Endpoints
Base URL: https://mindvault.ikigai-dynamics.com

These endpoints ALREADY EXIST and are LIVE:

### Query (chat/search)
- POST /api/query/{collection_name}
  Body: { "query": "user question", "conversation_history": [] }
  Response: { "answer": "AI response text", "sources": [...], "query": "..." }
  Sources contain: video_title, video_url, start_time, end_time, text, relevance_score

### Collections (channel list)
- GET /api/collections
  Response: Array of collection objects with name, display_name, description, 
  video_count, chunk_count, category, playlists

### Transcript
- GET /api/transcript/{video_id}
  Response: Full transcript with chunks, each having text, text_raw, 
  start_time, end_time, chunk_index

### Search within channel
- GET /api/search/{collection_name}?q={search_term}
  Response: Matching chunks with metadata

### Health
- GET /api/health
  Response: { "status": "ok" }

### Admin endpoints (require X-API-Key header)
- POST /api/admin/enrich-metadata
- POST /api/transcript/find-replace
- PUT /api/transcript/{video_id}/chunk/{chunk_index}
- POST /api/transcript/{video_id}/chunk/{chunk_index}/merge
- POST /api/transcript/{video_id}/reset
- POST /api/transcript/{video_id}/translate
- POST /api/transcript/{video_id}/apply-translation

IMPORTANT: The admin endpoints require the X-API-Key header. 
TubeVault should ONLY call read endpoints (query, collections, transcript, search, health).
Write/admin endpoints are for the creator dashboard (future feature).

### API Quirks
- Collection names use underscores: andrew_huberman, bright_insight, etc.
- The /api/collections endpoint auto-deduplicates collections by base name 
  (strips _v2, _v3 suffixes) and picks the best version
- Query responses include conversation_history support for follow-up questions
- Sources include start_time as seconds (float) — convert to YouTube timestamp 
  format for links: youtube.com/watch?v={id}&t={seconds}

## Pricing Tiers
- Free ($0): 3 channels, 5 questions/day, chat only
- Starter ($9/mo): 10 channels, unlimited questions
- Pro ($19/mo): All channels, transcripts, translation
- Premium ($39/mo): All channels, cross-channel search, priority support

## Indexed Channels (25 collections, as of March 2026)

### Health & Nutrition (14 channels)
- andrew_huberman — Andrew Huberman (468 videos, neuroscience & health)
- anthony_chaffee_md — Anthony Chaffee MD (1,485 videos, carnivore diet & nutrition)
- dr_brad_stanfield — Dr Brad Stanfield (422 videos, preventative medicine)
- dr_william_li — Dr. William Li (997 videos, nutrition & angiogenesis)
- foundmyfitness — FoundMyFitness / Rhonda Patrick (186 videos, science & longevity)
- bryan_johnson — Bryan Johnson (911 videos, longevity & biohacking)
- nick_norwitz_md_phd — Nick Norwitz MD PhD (509 videos, metabolic health)
- nathan_sages — Nathan Sages (199 videos, testosterone & men's health)
- healthy_immune_doc — Healthy Immune Doc / Dr. Liu (314 videos, immune health)
- jeremy_london_md — Jeremy London MD (454 videos, cardiovascular surgery)
- the_primal_podcast — The Primal Podcast / Rina (135 videos, metabolic health)
- the_diary_of_a_ceo — The Diary of a CEO (675 videos, business & health interviews)
- doctor_sethi — Doctor Sethi (22 videos, gut health)

### Ancient History & Exploration (6 channels)
- unchartedx — UnchartedX / Ben van Kerkwyk (245 videos, ancient sites & history)
- bright_insight — Bright Insight / Jimmy Corsetti (164 videos, lost ancient history)
- the_randall_carlson — Randall Carlson (1,662 videos, geology & sacred geometry)
- geocosmic_rex — GeoCosmic REX (210 videos, catastrophism & ancient history)
- history_with_kayleigh — History with Kayleigh (387 videos, archaeology & ancient structures)
- funny_olde_world — Funny Olde World (139 videos, ancient history & comedy)

### Theology & Apologetics (1 channel)
- wes_huff — Wes Huff (320 videos, Christian apologetics & interfaith dialogue)

### Spirituality (2 channels)
- katie_clarke — Katie Clarke (192 videos, spirituality & self-development)
- metanoia — Metanoia (57 videos, hidden knowledge & mysteries)

### Institutional / Education (1 channel)
- btu_cottbus_senftenberg — BTU Cottbus-Senftenberg (283 videos, German university)

### Private (not shown to users)
- personal_communications — Private (2 chunks, not public)
- 3blue1brown — 3Blue1Brown (2 chunks, test only)

## Collection Slug to Display Name Mapping
The /api/collections endpoint returns display_name for each collection.
Use that for the UI. Do NOT hardcode display names — fetch from API.

## File Structure
```
/app
  /page.tsx                    — Landing page
  /login/page.tsx              — Login (Supabase Auth)
  /signup/page.tsx             — Signup (Supabase Auth)
  /pricing/page.tsx            — Pricing tiers
  /dashboard/page.tsx          — Main chat interface (protected)
  /dashboard/transcripts/page.tsx — Transcript browser (Pro+)
  /channels/page.tsx           — Browse all channels (public)
  /impressum/page.tsx          — Legal: Impressum (German law)
  /datenschutz/page.tsx        — Legal: Privacy policy (DSGVO)
  /layout.tsx                  — Root layout with Inter font
/components
  /ui                          — shadcn/ui components
  /landing                     — Landing page sections
  /auth                        — Auth forms
  /chat                        — Chat interface components
  /pricing                     — Pricing cards
/lib
  /supabase.ts                 — Supabase client init
  /stripe.ts                   — Stripe client init
  /api.ts                      — MindVaultAPI client functions
  /channels.ts                 — Channel metadata (fetched from API)
  /subscription.ts             — Tier checking, limits
/public
  /logo.svg                    — TubeVault logo
```

## Key Rules
- Dark theme everywhere (bg-[#1d1d1d])
- All accent colors use #65ae4c, NEVER blue
- Mobile responsive first (many users come from phones)
- No generic AI aesthetics — premium, unique feel
- German legal pages required (Impressum, Datenschutz)
- All UI text in English (except legal pages which are German)
- Fetch channel data from /api/collections — do NOT hardcode
- Handle API errors gracefully (show user-friendly messages)
- Loading states on all async operations
- Free tier users see locked features with upgrade prompts, not errors

## Deployment
- Server: Hetzner CPX32 (46.225.139.82)
- URL: tubevault.ikigai-dynamics.com
- Reverse proxy: Caddy (auto HTTPS via Let's Encrypt)
- Port: 3001 (Next.js)
- Process manager: PM2
- MindVaultAPI runs on same server at port 8000

## Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_PREMIUM=

# MindVault Backend
NEXT_PUBLIC_API_URL=https://mindvault.ikigai-dynamics.com/api

# App
NEXT_PUBLIC_APP_URL=https://tubevault.ikigai-dynamics.com
```