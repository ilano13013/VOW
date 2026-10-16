# Setting up Supabase

As long as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are empty, VOW. runs in **local demo mode**. Data stays in the browser, and the organizer space shows a banner saying so. Follow these steps to connect a real backend.

## 1. Create the project

1. Create a project at https://supabase.com/dashboard.
2. **Region:** choose a European region (for example *West EU (Paris)*), for your guests' data.
3. Keep the database password in a password manager. The app never needs it.

## 2. Apply the migrations

Pick one of two methods.

**With the CLI (recommended)**

```bash
npx supabase@2 login
npx supabase@2 link --project-ref <your-project-ref>
npx supabase@2 db push            # applies supabase/migrations/*.sql in order
```

**From the dashboard:** in *SQL Editor*, paste and run, in order:

1. `supabase/migrations/20261016000001_core.sql`
2. `supabase/migrations/20261016000002_storage.sql`

> Never apply `supabase/tests/00_supabase_shim.sql` to a real project. It only simulates Supabase for local tests.

## 3. Configure authentication

In *Authentication → URL Configuration*:

- **Site URL**: your site's address (for example `https://vow.example.com`).
- **Redirect URLs**: add `https://vow.example.com/organizer` and `http://localhost:5173/organizer`.

In *Authentication → Providers → Email*:

- Keep **Confirm email** enabled. After sign-up, the app tells the user to open the confirmation link.
- Minimum password length: 8 characters or more.

## 4. Connect the frontend

In *Project Settings → API*, copy **Project URL** and the **anon public** key into `.env.local`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SITE_URL=https://vow.example.com
```

`VITE_SITE_URL` is used to build the links you send to guests.

> ⚠️ **Never** put the `service_role` key in a `VITE_*` variable. It bypasses RLS and would end up in the JavaScript sent to every visitor. It is only used in Edge Functions (Phase C).

## 5. Check

1. `npm run dev`, then go to `/organizer`. The "Mode démo local" banner should be gone.
2. Create an account, confirm the e-mail, create an invitation, add a guest, and publish it.
3. Open the guest link in a private window and answer the RSVP.
4. In *Table Editor → rsvps*, the answer appears.

## Security model (summary)

| Data | Who can read it | Who can write it |
| --- | --- | --- |
| `events` | its owner (RLS) | its owner: `slug`, `content`, `status` only |
| `events.plan`, `guest_limit`, `payment_status` | its owner | **server only** (service role / Stripe webhook) |
| `guests` (with tokens) | its owner | its owner (except `token`: rotation through `regenerate_guest_token`) |
| `rsvps` | the event owner | **the guest only**, through `submit_rsvp(token, …)` |
| `private.rsvp_attempts` | nobody through the API | `submit_rsvp` |
| Storage `memories/<event_id>/…` | the event owner | the event owner |

- **Guest tokens:** 192 bits of randomness (32 URL-safe characters), unique, and replaceable at any time. `get_invitation` returns *only* the guest's own name, the invitation content and their own answer. It returns nothing at all for an invalid token or an unpublished invitation, with no distinction between the two.
- **Server-side validation:** `submit_rsvp` checks the token, publication, deadline (Paris time), attendance, name (1 to 120 characters), companions (0 up to the guest's allowance), diet (500 characters max) and message (1,000 characters max). The frontend mirrors the same rules for comfort, but the server remains the authority.
- **Abuse protection:** at most 10 submissions per hour per guest, and 30 attempts per 10 minutes per IP (`x-forwarded-for` header supplied by the Supabase gateway). Every attempt is logged in `private.rsvp_attempts`, purged after 24 hours.
- **Plan quotas:** a trigger enforces the guest limit of the plan (80, 200 or 500).
- **Links and leaks:** links to external sites use `rel="noopener noreferrer"`, and the page sets `strict-origin-when-cross-origin`, so the token is never sent to other sites. `robots.txt` excludes `/i/` and `/organizer`.

## Database tests

`supabase/tests/10_security.test.sql` tests these rules on a real PostgreSQL (≥ 15):

```bash
DATABASE_URL=postgres://postgres@localhost:5432/postgres npm run test:db
```

The script recreates a `vow_test` database, applies the Supabase shim, then the migrations, and runs the assertions. It needs a local superuser and touches no other database.
