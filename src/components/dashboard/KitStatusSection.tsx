"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck, Loader2, ArrowRight } from "lucide-react";
import type { KitStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JourneyRail } from "@/components/dashboard/JourneyRail";
import {
  KIT_STEPS,
  KIT_STATUS_COPY,
  getKitActiveIndex,
} from "@/lib/dashboard/kit-status";
import { ApiError, postJson } from "@/lib/auth/api-client";

export function KitStatusSection({
  boxNumber,
  kitStatus,
  hasAddress,
  courierConfigured,
}: {
  boxNumber: string | null;
  kitStatus: KitStatus;
  hasAddress: boolean;
  courierConfigured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const needsAddress = courierConfigured && !hasAddress;

  async function handleRequestPickup() {
    setLoading(true);
    setError(null);
    try {
      await postJson(
        "/api/kit/request-pickup",
        needsAddress ? { addressLine1, city } : {}
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (kitStatus === "NOT_REQUESTED") {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <PackageCheck size={28} strokeWidth={1.7} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold text-foreground">
              Your box is ready for pickup
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-muted-foreground">
              {boxNumber
                ? `Box ${boxNumber} is registered to your account.`
                : "Your box is registered to your account."}{" "}
              Request a pickup and a courier will come collect it.
            </p>
          </div>

          {needsAddress && (
            <div className="w-full max-w-xs space-y-2 text-left">
              <Input
                placeholder="Street address"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                aria-label="Street address"
              />
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="City"
              />
              <p className="text-xs font-medium text-muted-foreground">
                We need your address so the courier can find you.
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
          <Button
            onClick={handleRequestPickup}
            disabled={loading || (needsAddress && (!addressLine1.trim() || !city.trim()))}
          >
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Requesting..." : "Request pickup"}
            {!loading && <ArrowRight size={16} />}
          </Button>
        </div>
      </Card>
    );
  }

  const activeIndex = getKitActiveIndex(kitStatus);

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="font-mono text-[13px] font-semibold tracking-wide text-muted-foreground">
            {boxNumber ? `BOX ${boxNumber}` : "YOUR BOX"}
          </div>
          <div className="font-display mt-1.5 text-lg font-extrabold text-foreground">
            DNA Test Tracking
          </div>
        </div>
      </div>

      <div className="px-1 py-1">
        <JourneyRail steps={KIT_STEPS} activeIndex={activeIndex} />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <span className="text-sm font-semibold text-muted-foreground">
          {KIT_STATUS_COPY[kitStatus]}
        </span>
      </div>
    </Card>
  );
}
