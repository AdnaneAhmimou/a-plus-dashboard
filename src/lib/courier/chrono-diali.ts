// Thin client for the Chrono Diali courier API (pickup dispatch + parcel
// tracking). Every call needs CHRONO_DIALI_API_KEY — without it,
// isCourierConfigured() is false and callers fall back to local-only
// tracking, same pattern as the OpenRouter/Firebase gating elsewhere in
// this project.

const BASE_URL = process.env.CHRONO_DIALI_BASE_URL || "https://app.shipsy.in";
const API_KEY = process.env.CHRONO_DIALI_API_KEY;
const CUSTOMER_CODE = process.env.CHRONO_DIALI_CUSTOMER_CODE || "";

export function isCourierConfigured(): boolean {
  return Boolean(API_KEY);
}

export class CourierNotConfiguredError extends Error {
  constructor() {
    super("Chrono Diali is not configured (CHRONO_DIALI_API_KEY is unset)");
    this.name = "CourierNotConfiguredError";
  }
}

export class CourierApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CourierApiError";
    this.status = status;
  }
}

interface ChronoAddress {
  name: string;
  phone: string;
  address_line_1: string;
  city: string;
  country: string;
  pincode?: string;
}

async function chronoFetch(path: string, init: RequestInit): Promise<unknown> {
  if (!API_KEY) throw new CourierNotConfiguredError();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "api-key": API_KEY,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (body as { error?: { message?: string } } | null)?.error?.message ??
      `Chrono Diali request failed (${res.status})`;
    throw new CourierApiError(message, res.status);
  }
  return body;
}

const LAB_DESTINATION: ChronoAddress = {
  name: process.env.LAB_ADDRESS_NAME || "A+ Laboratory",
  phone: process.env.LAB_ADDRESS_PHONE || "",
  address_line_1: process.env.LAB_ADDRESS_LINE1 || "",
  city: process.env.LAB_ADDRESS_CITY || "",
  country: process.env.LAB_ADDRESS_COUNTRY || "Morocco",
};

// One DNA test box, en route from the patient to the lab. Creates the
// trackable consignment — this is what generates the reference_number
// that tracking, the label, and the webhook all key off of.
//
// No `pieces_detail` — Chrono Diali confirmed omitting it entirely
// (rather than sending a single-piece array) is the correct shape for
// this call; `boxNumber` is kept as a parameter for the caller's own
// bookkeeping even though it's no longer sent in the request body.
export async function createConsignment(patient: {
  name: string;
  phone: string;
  addressLine1: string;
  city: string;
  country: string;
  boxNumber: string;
}): Promise<{ referenceNumber: string }> {
  const origin: ChronoAddress = {
    name: patient.name,
    phone: patient.phone,
    address_line_1: patient.addressLine1,
    city: patient.city,
    country: patient.country,
  };

  const body = await chronoFetch(
    "/api/customer/integration/consignment/upload/softdata/v2",
    {
      method: "POST",
      body: JSON.stringify({
        pickup_type: "BUSINESS",
        load_type: "NON-DOCUMENT",
        customer_code: CUSTOMER_CODE,
        reference_number: "",
        service_type_id: "NORMAL",
        origin_details: origin,
        destination_details: LAB_DESTINATION,
        return_details: origin,
      }),
    }
  );

  const referenceNumber = (body as { reference_number?: string })
    ?.reference_number;
  if (!referenceNumber) {
    throw new CourierApiError(
      "Chrono Diali did not return a reference_number",
      502
    );
  }
  return { referenceNumber };
}

// Dispatches the actual courier for collection. Called after
// createConsignment — the pickup slot defaults to the next day,
// 09:00-12:00 (the earliest of Chrono Diali's four fixed windows); there
// is no slot picker in the patient UI yet.
export async function createPickup(patient: {
  name: string;
  phone: string;
  addressLine1: string;
  city: string;
  country: string;
}): Promise<{ pickupId: string }> {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const date = [
    String(tomorrow.getDate()).padStart(2, "0"),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    tomorrow.getFullYear(),
  ].join("/");

  const body = await chronoFetch("/api/customer/integration/pickup/create", {
    method: "POST",
    body: JSON.stringify({
      pickup_type: "BUSINESS",
      customer_code: CUSTOMER_CODE,
      pickup_address: {
        name: patient.name,
        phone: patient.phone,
        address_line_1: patient.addressLine1,
        city: patient.city,
        country: patient.country,
      },
      load_type: "NON-DOCUMENT",
      total_items: "1",
      total_weight: "1",
      pickup_slot: { start: "09:00", end: "12:00", date },
    }),
  });

  const pickupId = (body as { data?: { pickupId?: string } })?.data
    ?.pickupId;
  if (!pickupId) {
    throw new CourierApiError("Chrono Diali did not return a pickupId", 502);
  }
  return { pickupId };
}

export interface CourierTrackingEvent {
  type: string;
  event_time: number;
  event_description?: string;
  location?: string;
}

export interface CourierTrackingResult {
  status: string;
  events: CourierTrackingEvent[];
}

export async function trackParcel(
  referenceNumber: string
): Promise<CourierTrackingResult> {
  const body = (await chronoFetch(
    `/api/customer/integration/consignment/track?reference_number=${encodeURIComponent(
      referenceNumber
    )}`,
    { method: "GET" }
  )) as { status?: string; events?: CourierTrackingEvent[] };

  return { status: body.status ?? "unknown", events: body.events ?? [] };
}
