import type { KitStatus } from "@prisma/client";

// Only these transitions are worth telling a patient about — NOT_REQUESTED
// is the "nothing has happened yet" starting state, so it never earns one.
const STATUS_NOTIFICATION_MESSAGE: Partial<Record<KitStatus, string>> = {
  PICKUP_REQUESTED:
    "Pickup requested — we'll notify you once your box is collected.",
  PICKED_UP: "Your box has been picked up by the courier.",
  IN_TRANSIT: "Your box is on its way to the laboratory.",
  TESTING: "Your sample has arrived and is now being tested.",
  RESULTS_READY: "Your results are ready. View them in your dashboard.",
};

// Structurally typed rather than `Prisma.TransactionClient` so this works
// identically against a real transaction client and against the test
// mock (which is a plain object, not a real Prisma client instance).
interface NotificationCreator {
  notification: {
    create: (args: { data: { userId: string; message: string } }) => Promise<unknown>;
  };
}

export async function notifyKitStatusChange(
  db: NotificationCreator,
  userId: string,
  status: KitStatus
): Promise<void> {
  const message = STATUS_NOTIFICATION_MESSAGE[status];
  if (!message) return;
  await db.notification.create({ data: { userId, message } });
}

// Structurally typed the same way as NotificationCreator above.
interface AdminNotifier {
  user: {
    findMany: (args: {
      where: { role: { in: ("ADMIN" | "SUPER_ADMIN")[] } };
      select: { id: true };
    }) => Promise<{ id: string }[]>;
  };
  notification: {
    createMany: (args: {
      data: { userId: string; message: string }[];
    }) => Promise<unknown>;
  };
}

// The admin side of the notification system: a pickup request is the one
// patient-triggered event admins actually need to act on (dispatch the
// courier), so every ADMIN/SUPER_ADMIN gets notified, unlike kit-status
// changes which stay patient-only. Returns the notified admin IDs so the
// caller can also push to them (outside the transaction, same pattern as
// notifyKitStatusChange's push counterpart).
export async function notifyAdminsOfPickupRequest(
  db: AdminNotifier,
  patientName: string,
  boxNumber: string | null
): Promise<string[]> {
  const admins = await db.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true },
  });
  if (admins.length === 0) return [];

  const message = `${patientName} requested a pickup${
    boxNumber ? ` for box ${boxNumber}` : ""
  }.`;
  await db.notification.createMany({
    data: admins.map((admin) => ({ userId: admin.id, message })),
  });
  return admins.map((admin) => admin.id);
}

export function getAdminPickupRequestPushPayload(
  patientName: string,
  boxNumber: string | null
): { title: string; body: string } {
  return {
    title: "A+ Laboratory",
    body: `${patientName} requested a pickup${
      boxNumber ? ` for box ${boxNumber}` : ""
    }.`,
  };
}

// Push notifications are sent outside the DB transaction (a network call
// has no place holding a transaction open), so callers need the same
// copy for both: the in-app Notification row and the push payload.
export function getKitStatusPushPayload(
  status: KitStatus
): { title: string; body: string } | null {
  const message = STATUS_NOTIFICATION_MESSAGE[status];
  if (!message) return null;
  return { title: "A+ Laboratory", body: message };
}
