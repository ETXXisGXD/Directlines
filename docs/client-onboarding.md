# Directlines Client Onboarding

Live store: https://directlines-technologies.vercel.app

## Admin access

- Admin URL: https://directlines-technologies.vercel.app/admin
- Email: Bizhakin@gmail.com
- Temporary password: see `ADMIN-CREDENTIALS.local.txt` in the project folder.
- Change the password after first login.

## Daily workflow

1. A customer places an order on the website.
2. The order appears in Admin > Orders with status **received** and payment **pending**.
3. Open the order, confirm stock and payment on WhatsApp, then set payment to **paid**.
4. Set the order status as it moves: received, confirmed, processing, dispatched, delivered.
5. Add the courier and tracking number so the customer can see it on the tracking page.

## Products

- Admin > Products lets you edit price, stock, photos, options and SEO.
- Use **Bulk price update** when prices change across a category.
- Leave stock blank when you are not counting units. A number will auto-decrement on orders.
- Upload official product photos in Admin > Products. The current image set is partial because some models did not have a reliable listing image.

## EasyBuy

- Applications arrive in Admin > EasyBuy.
- Each application contains the full name, phone number, target model and two guarantor phone numbers.
- Update the status to contacted, approved, declined or closed.
- Approval is not automatic. Confirm the deposit and monthly amount in writing.

## Repairs

- Bookings arrive in Admin > Repairs.
- Contact the customer, diagnose the device and confirm the quote before starting.
- Update the status to scheduled, in progress, completed or cancelled.

## Blog and areas

- Admin > Blog manages the 30 guides and the 8 area posts.
- Area pages are seeded at `/areas/abuja`, `/areas/karu`, `/areas/nyanya`, `/areas/jikwoyi`, `/areas/kubwa`, `/areas/wuse`, `/areas/garki` and `/areas/maitama`.
- Keep prices factual and confirm stock before publishing claims.

## Settings

Admin > Settings controls:

- store name, phones, email, address and hours
- hero copy
- EasyBuy percentage and tenures
- delivery zones and fees
- bank details and announcement bar
- warranty and return policies
- SEO and social links

## Meta ads

Admin > Meta is ready for the Pixel ID and test event code. The Conversions API token and catalog secret are environment variables on Vercel. Add them when the business owner provides Meta access.

## Support

Contact BizHakIn with the order number and a screenshot if anything looks wrong.
