"use client";

import { useEffect, useState } from "react";
import { BellRing, BellOff, Check } from "lucide-react";

import { requestPushRegistration, onForegroundPush } from "@/lib/firebase/client";
import { postJson } from "@/lib/auth/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Status = "checking" | "unsupported" | "denied" | "off" | "on" | "requesting" | "error";

// Browser permission is the source of truth for whether push is "on" —
// there's no server-side signal for it, since a user can revoke it from
// their browser settings without our backend ever finding out.
function readBrowserStatus(): Status {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "on";
  if (Notification.permission === "denied") return "denied";
  return "off";
}

export function EnablePushButton() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    setStatus(readBrowserStatus());
  }, []);

  useEffect(() => {
    if (status !== "on") return;
    const unsubscribe = onForegroundPush(({ title, body }) => {
      if (Notification.permission === "granted") {
        new Notification(title || "A+ Laboratory", { body });
      }
    });
    return () => {
      unsubscribe.then((fn) => fn());
    };
  }, [status]);

  async function handleEnable() {
    setStatus("requesting");
    const result = await requestPushRegistration();

    if (result.status === "unsupported") {
      setStatus("unsupported");
      return;
    }
    if (result.status === "denied") {
      setStatus("denied");
      return;
    }

    try {
      await postJson("/api/notifications/push-token", { token: result.token });
      setStatus("on");
    } catch {
      setStatus("error");
    }
  }

  if (status === "checking") return null;

  if (status === "on") {
    return (
      <Card className="flex flex-row items-center gap-3 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <Check size={16} strokeWidth={2.2} />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Push notifications are enabled on this device.
        </p>
      </Card>
    );
  }

  if (status === "denied" || status === "unsupported") {
    return (
      <Card className="flex flex-row items-center gap-3 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <BellOff size={16} strokeWidth={2} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {status === "denied"
            ? "Notifications are blocked for this site. Enable them in your browser settings to get push alerts."
            : "This browser doesn't support push notifications."}
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-row items-center justify-between gap-3 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <BellRing size={16} strokeWidth={2.2} />
        </div>
        <p className="text-sm font-medium text-foreground">
          Get notified on this device when your box status changes.
        </p>
      </div>
      <Button
        size="sm"
        onClick={handleEnable}
        disabled={status === "requesting"}
      >
        {status === "requesting" ? "Enabling..." : status === "error" ? "Try again" : "Enable"}
      </Button>
    </Card>
  );
}
