# A+ Laboratory — Patient App

Flutter companion app for A+ Laboratory patients: the same account, same
DNA results, same ancestry section as the web dashboard at
[`../dashboard`](../dashboard), in a native mobile interface for iOS and
Android.

The web dashboard's API routes (`dashboard/src/app/api/...`) are the
intended backend for this app — the plan is a Flutter client against
that existing API, not a second backend. See `dashboard/DESIGN.md` for
how the web app's data model, auth and result templates work; this app
should mirror those shapes rather than reinvent them.

## Project identity

- Org: `com.aplaboratoire`
- Application ID: `com.aplaboratoire.aplus_patient`
- Targets: iOS, Android

## Getting started

```bash
flutter pub get
flutter run
```

A few Flutter resources if needed:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)
