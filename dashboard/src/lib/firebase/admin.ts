import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

import { prisma } from "@/lib/prisma";

// Push sending needs a Firebase Admin service account (a private key),
// which is separate from the public web config used client-side. Without
// it, device tokens still register fine — sending just silently no-ops,
// the same "build it, gate it clearly" pattern used for the AI report
// analysis when no OpenRouter key is configured.
function getAdminApp(): App | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  const existing = getApps();
  if (existing.length > 0) return existing[0];

  try {
    const serviceAccount = JSON.parse(raw);
    return initializeApp({ credential: cert(serviceAccount) });
  } catch (err) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON:", err);
    return null;
  }
}

export function isPushConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
}

// Sends a push to every device the user has registered. Best-effort: a
// push failure never bubbles up to the caller (kit status change / report
// upload must still succeed even if FCM is unreachable or a token is
// stale) — invalid tokens are pruned from the database as they're found.
export async function sendPushToUser(
  userId: string,
  notification: { title: string; body: string }
): Promise<void> {
  const app = getAdminApp();
  if (!app) return;

  const tokens = await prisma.pushToken.findMany({
    where: { userId },
    select: { id: true, token: true },
  });
  if (tokens.length === 0) return;

  try {
    const response = await getMessaging(app).sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification,
    });

    const staleTokenIds = response.responses
      .map((result, index) => ({ result, id: tokens[index].id }))
      .filter(
        ({ result }) =>
          !result.success &&
          (result.error?.code === "messaging/registration-token-not-registered" ||
            result.error?.code === "messaging/invalid-registration-token")
      )
      .map(({ id }) => id);

    if (staleTokenIds.length > 0) {
      await prisma.pushToken.deleteMany({ where: { id: { in: staleTokenIds } } });
    }
  } catch (err) {
    console.error("Push notification send failed:", err);
  }
}
