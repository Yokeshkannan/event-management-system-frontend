# Event Management Platform: Project Overview & Architecture

## 1. System Architecture
The application is built as a complete Full-Stack web app utilizing:
- **Backend:** Node.js + Express.js
- **Frontend:** Next.js (App Router) + React + Tailwind CSS + Lucide Icons natively integrated.
- **Database:** PostgreSQL (Supabase schema mapped)

## 2. Implemented Design Patterns
Following the initial academic requirements, the codebase leverages structured software engineering design patterns:
- **MVC (Model-View-Controller):** Structured strictly on the Express backend (`routes/` -> `controllers/` -> DB).
- **Proxy Pattern:** Realized in `authMiddleware.js` acting as a secure proxy gateway evaluating and protecting API routes using JWT.
- **Pipe-and-Filter Pattern:** Used flawlessly within `bookingController.js` representing a 6-stage sequential validation pipeline to process tickets:
  1. Validate User → 2. Validate Event active state → 3. Filter check Seat Availability → 4. Filter against Duplicate Bookings → 5. Calculate Discount Rates → 6. Atomic DB Booking Insertion.
- **Adapter Pattern:** Achieved in `ticketController.js` via a unified `PaymentGatewayFactory` that switches dynamically between `StripeAdapter` and `RazorpayAdapter` instances depending on the checkout provider chosen, abstracting payment logic completely away from business routines.

## 3. Backend Functionality
- **Auth Service (`authController.js`):** JWT-based authentication system logging in users as strictly `organizer` or `attendee`, handling hashed endpoints using `bcryptjs`. Expanded to support profile updates and password changes.
- **Event Engine (`eventController.js`):** CRUD operations handling Event records, enforcing constraints that only the creator/organizer can modify their respective events.
- **Image Upload Service (`upload.js`):** Implements local file uploading via `multer`, securely storing custom event images directly in the backend `/uploads` directory and serving them statically.
- **Booking & Ticket Management (`bookingController.js`, `ticketController.js`):** Robust backend pipeline managing seat availability, discount rates, and atomic transactions. 
- **Schema Validation (`schema.sql`):** Fully normalized PostgreSQL database schema handling tables mapping relationships for `users`, `events` (with image URL support), `ticket_types`, `bookings`, and `payments`. Includes relational foreign keys securely enforcing soft-state.

## 4. Frontend UI & Aesthetics
The Next.js frontend has been crafted leveraging multi-platform inspirations to mimic premium tier products with fully integrated API data:
- **Global Theming Engine:** Implements `next-themes` overriding `globals.css` variable bounds (`--bg-dark`, `--bg-card`, `--primary`, etc.). Instantly allows toggling between slick Dark Mode and crisp Light Mode dynamically tracking the OS standard or the `Navbar` toggler without hydration mismatches. Includes persistent theme states.
- **Navigation & Layout:**
  - **Dynamic Navbar (`Navbar.js`):** Features a user-specific profile dropdown, centralized theme toggling, and clean state handling based on authentication.
  - **Sliding Sidebar (`Sidebar.js`):** A responsive, hover-to-expand sidebar for both Attendee and Organizer dashboards, ensuring perfectly aligned icons and a premium feel.
- **Home/Landing Page (`page.js`):**
  - Features an atmospheric dark-gradient hero top with inline search bars tracking Event Name, Location, and Date.
  - Integrates real backend API data for events, showing "Recommended Events", "Music", "Tech", etc.
- **Categories Browser (`categories/page.js`):**
  - Dedicated browsing page featuring dynamic filtering via custom gradient icon cards, actively querying backend category routes with animated layouts.
- **Event Detail Page (`events/[id]/page.js`):**
  - Modernized with a clean, professional white-themed aesthetic for readability. Intelligently integrates custom uploaded event images rendering underneath a sleek dark gradient overlay, gracefully falling back to a crisp light header when no image is present.
- **Monobank-Style Dashboards (`dashboard/`):**
  - Bound globally by `dashboard/layout.js`, rendering a premium fixed left sidebar housing profile IDs, contextual icons, log transitions, and theme states.
  - **Organizer View:** Comprehensive sub-pages for "Overview" (high-level revenue and ticket graphs), "My Events", "Attendees" (detailed flat-table ledger), "Statistics", and "Settings".
  - **Attendee View:** "My Tickets", "History" (modeling total spent aggregates and dynamic colored arrows for booking/cancellations streams mapped gracefully over translucent glassmorphic backdrop filters), and "Settings".
- **Reusable Component Blocks:**
  - `EventCard.js`: Customized cleanly to adapt to gradient ticket pricing labels, dynamic hover states throwing CSS shadows, **dynamic event images** (falling back to emojis if needed), tracking precise seat exhaustion thresholds cleanly.
  - `BookingForm.js`: Modal-based functional UI for seamless ticket checkout processes, routing users smoothly post-login.
