# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary buyers are **couples planning their wedding** (direct B2C). They order an invitation, compose it themselves from a private organizer space, and send a personal link to each guest.

Secondary audience: **guests**, who open the invitation once or twice, mostly on an iPhone from a message (SMS, WhatsApp, email), then reply to the RSVP.

Wedding planners and B2B are not targeted in MVP 1.0.

## Product Purpose

VOW. creates immersive digital wedding invitations that work like digital art pieces while keeping real functions: a programme, venues, a countdown, individual RSVPs and a dashboard of replies.

Success means a couple pays, publishes, and their guests open the invitation and reply without friction.

Signature: **Your moment. Another dimension.**

## Positioning

A digital couture house, not a traditional wedding platform. Every invitation is a composition (living 3D glass sculpture, monumental editorial typography, cinematic lighting), and privacy is built in: each guest gets a secure personal token and the guest list is never public.

## Operating Context

- Guests: mobile first (iPhone Safari is the priority), opened from a link, often on a weak connection.
- Couples: compose on desktop or mobile, then share the links one by one.
- Market: France. Content is in French, with English editorial titles ("Our Story", "The Day", "Open the invitation", "Memories").

## Capabilities and Constraints

- Offers: Essential €49, Signature €99, Couture €179, one-time payment (Stripe Checkout). A payment is valid only after a server-side Stripe webhook check.
- Backend: Supabase (auth, Postgres with RLS, storage). Admin keys are never exposed to the frontend.
- The 3D layer must degrade gracefully: CSS fallback without WebGL, and respect for prefers-reduced-motion.
- Memories photo upload is architecture-only in MVP 1.0.
- Undecided: per-invitation bilingual mode, custom domains, the B2B planner space.

## Brand Commitments

- Name: **VOW.** (with the period). Signature: "Your moment. Another dimension."
- Binding palette from the brief: Obsidian #0B0B12, Pearl #EDE9E4, Iris #C4B5FD, Chrome #B9C8D3.
- Binding world from the brief: Digital Art / Futuristic Couture, with glass and chrome sculptures, iridescence, light particles, monumental editorial type and asymmetric composition. No generic templates, pervasive gradients or standard glassmorphism.

## Evidence on Hand

- No real testimonials, customers, press or photos exist. **None may be fabricated.**
- The demo invitation (Camille & Gabriel, 18 July 2027, Provence) is fictional and must stay labelled as such. No real address may be invented.

## Product Principles

1. A piece, not a template: every surface must feel composed and deliberate.
2. Private by construction: guest data is only reachable through a personal token or by the owning organizer.
3. Phone first: the guest's iPhone experience is the reference.
4. Honest product: no fake payment, no fake results, and features not yet available are labelled as such.
5. Stability over spectacle: effects never break reading, forms or performance.

## Accessibility & Inclusion

WCAG 2.2 AA: full keyboard navigation, sufficient contrast on the dark background, accessible forms, prefers-reduced-motion respected, no involuntary horizontal scroll.
