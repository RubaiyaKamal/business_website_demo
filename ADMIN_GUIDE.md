# GreenVolt Electronics — Admin Guide

A short, non-technical guide to running the website from the admin dashboard.

---

## 1. Signing in

1. Go to `http://localhost:3000/en/admin` (use `/ur/admin` for the Urdu interface).
2. You will be asked to log in. Use the email and password set by
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` in the `.env` file.
3. After signing in you land on the **Dashboard**, which shows quick counts
   (services, projects, blog posts, testimonials) and the most recent inquiries.

If the page says you are not authorized, your account does not have the `admin`
role. Ask whoever set up the site to grant it (see the README for the seed admin).

To sign out, use **Log out** in the sidebar.

---

## 2. The dashboard

- **Dashboard** — totals and recent inquiries.
- **Services** — the services you offer (repair, installs, etc.).
- **Projects** — showcase jobs you have completed for customers.
- **Blog** — articles and news posts.
- **Testimonials** — customer reviews.
- **Inquiries** — messages submitted through the contact form.
- **Settings** — phone, WhatsApp, address, email, social links, map and analytics.

Each content section has the same layout: a table of existing items with a
**Create** button, and edit / publish / delete actions per row.

---

## 3. Adding and editing content

1. Click **Create** (or the pencil icon to edit an existing item).
2. Fill in the fields. Titles and summaries are required; English and Urdu fields
   are separate so you can provide both languages.
3. Choose **Save**.

Field tips:

- **Slug** — the web address of the item (e.g. `mobile-repair`). Leave it blank and
  one is generated from the title automatically. It must be unique.
- **Image / Cover image** — click **Upload image** to add a picture, or paste a URL.
  Accepted formats: JPEG, PNG, WebP, GIF, AVIF.
- **Tags** — one per line.
- **Sort order** — lower numbers appear first.
- **Published** — controls whether visitors can see the item.

### Publishing

Nothing is visible to the public until it is **published**. Content sections have a
publish toggle (the check / cross icon). Blog posts default to **draft** so you can
review them before they go live; other content defaults to published.

---

## 4. Drafting with AI (optional)

If the AI helper is enabled, the **blog editor** shows an **AI assistant** bar with two
buttons:

- **Draft with AI** — writes a first draft of the post body from the title.
- **Suggest meta description** — writes a short SEO description for the post.

Add a title first, then click a button. The generated text is placed in the editor for
you to review and edit. **The AI never saves or publishes anything by itself** — you
remain in control.

If you see "AI helper is disabled" or "unavailable", the feature is not switched on or
the service is temporarily unreachable; you can still write everything manually.

---

## 5. Handling inquiries

Open **Inquiries** to see messages from the contact form.

- Use the search box and status filter to find messages.
- Change a message's status to **read** or **replied** as you work through them.
- Delete messages you no longer need.

When a new inquiry arrives, the owner receives an email notification, and the sender
receives an automatic confirmation (if email is configured).

---

## 6. Site settings

Open **Settings** to update the details used across the site, such as:

- Contact email and phone, WhatsApp number.
- Shop address and the Google Maps embed link.
- Social media links (Facebook, Instagram, TikTok).
- Google Analytics ID.

Click **Save settings** when done. Changes appear on the public site right away (pages
refresh on a short cache interval).

---

## 7. Tips and troubleshooting

- **Save doesn't work / "Session expired"** — sign out and sign in again.
- **An image won't upload** — make sure it is a supported image type and smaller than
  the configured size limit (default 5 MB).
- **A page looks outdated** — public pages refresh automatically every couple of
  minutes; wait briefly and reload.
- **Something looks wrong on the public site** — check that the item is **Published**
  and that its fields are filled in correctly.
