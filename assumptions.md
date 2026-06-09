# Getting started


Clone the repository and run:

```bash
./setup.sh
```

This installs dependencies, sets up the database, seeds it with 100 posts from JSONPlaceholder, and starts the dev server. 


Then open http://localhost:3000/posts

# Assumptions

## Product assumptions

### What "user" means in this brief

The brief uses the word "user" to describe two different concepts, which required a deliberate interpretation.

The ambiguity starts here:

> *"Create the necessary tables for a blog where several users can post several posts."*

The phrase "several users can post several posts" has two valid readings. The first is that "post" is used in the publishing sense — users are authors who create and own content, making this a multi-author blogging platform where authentication and ownership would be natural requirements. The second is that "post" describes the relational capability of the schema — a user entity can be associated with many post entities — and "blog" is simply the domain framing chosen to justify a one-to-many relationship, not a product specification.

Both readings are defensible from that sentence alone. What resolved the ambiguity was the sentence that followed:

> *"You can use the data from these APIs to seed the tables: jsonplaceholder.typicode.com/users and jsonplaceholder.typicode.com/posts."*

The word **seed** is the key signal. Seeding means populating a database with initial fixture data before any real user interaction happens. Real authenticated authors are not seeded — they register. The brief explicitly points to JSONPlaceholder, a public read-only fixture API, as the source for both users and posts. This means the user records in the database are pre-made data representing post authors, not real accounts created through the app. An authoring platform would not seed its users from a third-party fixture dataset.

A second signal confirmed this reading:

> *"allows the users to filter the posts by the userId of whoever wrote the post"*

The phrase "whoever wrote the post" refers to the author — a seeded record in the database. The person doing the filtering is a separate entity: the app visitor. These are two different concepts sharing the same word.

**The decision taken:** the user entity in the database represents a post author sourced from JSONPlaceholder fixture data — not an app account. The traveller described in the brief is an anonymous app visitor with no database presence. This interpretation was chosen because it is the one the brief's own words consistently support: seeded data is not registered users, JSONPlaceholder records are not real accounts, and the filter targets the author of a post rather than the identity of the viewer.

The consequence of this decision is that authentication is out of scope. There are no app accounts, no sessions, and no ownership checks. Any visitor can read all posts and delete any post — which is consistent with the brief never mentioning authentication anywhere in its five steps.

### Any visitor can delete any post

The brief specifies a delete action with no mention of authentication, ownership, or access control. No auth layer was added. Deletion is public.

### The filter is single-select

One author at a time can be filtered. The brief says "filter by userId" — singular. Multi-select was not implemented.

### All 100 posts are shown with no pagination

The brief does not define a page size or specify infinite scroll. Displaying all seeded posts is the simplest valid interpretation.

### Deletion is permanent

The confirmation modal is the only safeguard. There is no undo, trash, or soft-delete.

### The filter is optional

The default view shows all posts. Selecting "All authors" from the dropdown restores the full list.

### Original JSONPlaceholder IDs are preserved

The seed inserts users and posts with their original numeric IDs so the filter maps directly to the author without any remapping layer. This maintains relational integrity between the two seeded datasets.

---

## Technical decisions

### Project setup

Next.js 16 App Router was chosen because the challenge explicitly states "a technology like Next.js seems like a perfect match." The App Router enables Server Components, Server Actions, and file-based conventions that handle the required features with minimal boilerplate. TypeScript strict mode is enabled throughout with no untyped boundaries.

Tailwind CSS and a component library were used for styling, providing accessible, production-grade UI components without external runtime dependencies.

### Database

Prisma with SQLite was used as suggested by the challenge. The seed script fetches from the JSONPlaceholder APIs, inserts users before posts to satisfy the foreign key constraint, and is idempotent — if data already exists it skips insertion entirely. Only the fields needed for the UI are stored; nested objects from JSONPlaceholder are not persisted.

The database file is not committed to the repository. The evaluator runs the migration and seed commands to create and populate it locally. The connection details are in the committed file as explicitly required by the challenge.

### Bad network handling

The challenge states that users travel to places with bad or unstable internet connections and asks for features to improve their experience. It also hints that Next.js is "a production-ready framework" that "provides a lot of functionality for developers."

This was read as a signal to use the framework's own built-in capabilities rather than reaching for external libraries. The problem described — bad and unstable connections — means slow responses, timeouts, and intermittent failures. It does not mandate full offline support. The solution targets that specific problem using Next.js 16's native server-side caching model, which serves posts from cache on slow or unstable connections without hitting the database on every request. When a post is deleted, only the relevant cache entry is invalidated surgically.

A network banner was added that detects when the user's connection is lost and displays a visible warning. It disappears automatically when connectivity is restored.

### Server and client responsibilities

Data fetching happens on the server — no client-side API calls are made for reading posts. Only the components that genuinely need browser interactivity run on the client: the author filter dropdown and the delete button. Everything else is server-rendered, which minimises the JavaScript sent to the browser — a meaningful concern for users on slow connections.

Mutations use Next.js Server Actions rather than traditional API routes. The delete action runs server-side and updates the cache on success.

### Delete confirmation and error handling

Each post card has a delete button that opens a confirmation dialog before proceeding. On success the post disappears from the list. On failure a toast notification tells the user what went wrong.

Two layers of error handling are in place: expected failures like a failed delete return a typed error that surfaces as a toast, while unexpected exceptions are caught by error boundaries that offer a retry button.

---

## Problems encountered during development

### Offline delete appeared to work on localhost — but wasn't real

During testing, deleting a post while offline appeared to succeed — the post count dropped and stayed after reconnecting. This seemed like the offline handling was working correctly, but it turned out to be a false positive. Because the app runs on localhost, the delete request was still reaching the local server through the loopback interface even with wifi turned off. It was never a real offline test.

The correct way to simulate offline on localhost is to use browser DevTools network throttling set to Offline, which cuts the connection at the browser level including localhost. Once that was used, the real behavior became visible.

### Deleting while offline broke the entire page

When tested correctly with DevTools offline mode, clicking delete while offline caused the whole page to crash to an error screen instead of showing an error message and staying on the posts list. The root cause was that a complete network failure rejects the request before it reaches any error handling code, and that rejection was being caught by the page-level error boundary rather than handled gracefully.

The fix was to add error handling around the delete call itself so that network-level failures are caught and shown as a toast — the same experience as any other delete failure — rather than breaking the page. This was verified by retesting with DevTools offline mode after the fix.

---

## What is out of scope

**Authentication and authorization** — the brief does not mention it. The seeded data confirms users are fixture records, not accounts. Posts are publicly readable and deletable.

**Pagination** — the brief does not specify a page size or pagination behavior. All 100 seeded posts are returned.

**Post creation and editing** — only listing and deletion are required by the brief.

**Automated tests** — the brief does not require them. In a production codebase the delete flow and error handling would have test coverage.