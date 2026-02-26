# Supabase SQL Run Order

Run these in Supabase SQL Editor in this order:

1. `01_booking_hardening.sql`
2. `02_rls_policies.sql`
3. `03_rooms_i18n.sql`
4. `04_verification.sql`
5. `05_inventory_and_occupancy.sql` (optional, applies your requested room mix and occupancy profile)
6. `06_fixed_60pct_seed_ignoring_new_bookings.sql` (optional alternative: fixed 60% seed baseline independent from new bookings)
7. `07_randomized_60pct_week_seed.sql` (optional alternative: randomized ~60% occupancy for today + next 6 days, attic kept available)
8. `08_service_bookings.sql` (required if you want service offers to be bookable in UI + DB)
9. `09_guest_feedback.sql` (required if you want the new feedback form to persist comments in DB)
10. `10_conversion_waitlist_and_service_slots.sql` (required for room-type availability calendar, service time slots, and waitlist)
11. `11_reseed_70pct_until_year_end_preserve_real.sql` (optional: fills occupancy baseline to ~70% until Dec 31 without deleting/cancelling real bookings)

The app code expects these DB changes to be applied.
