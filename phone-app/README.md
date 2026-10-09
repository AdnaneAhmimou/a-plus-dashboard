# A+ Laboratory — Mobile App

Flutter companion app for A+ Laboratory patients: the same account, same
DNA results, same ancestry section as the web dashboard at
[`../dashboard`](../dashboard), in a native mobile interface.

Nothing is scaffolded here yet. The web dashboard's API routes
(`dashboard/src/app/api/...`) are the intended backend for this app —
the plan is a Flutter client against that existing API, not a second
backend. See `dashboard/DESIGN.md` for how the web app's data model,
auth and result templates work; the mobile app should mirror those
shapes rather than reinvent them.
