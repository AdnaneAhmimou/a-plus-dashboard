"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Phone,
  Package,
  CalendarPlus,
  Pencil,
  Loader2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  updatePatientSchema,
  type UpdatePatientInput,
} from "@/lib/admin/validation";
import { ApiError, postJson } from "@/lib/auth/api-client";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon size={16} strokeWidth={1.8} className="text-muted-foreground" />
      </div>
      <div>
        <div className="text-[11.5px] font-semibold text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

export interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  boxNumber: string | null;
  registeredLabel: string;
}

export function PatientInfoCard({ patient }: { patient: PatientInfo }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UpdatePatientInput>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone ?? "",
    },
  });

  async function onSubmit(values: UpdatePatientInput) {
    setFormError(null);
    try {
      await postJson(`/api/admin/patients/${patient.id}`, values);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  if (editing) {
    const submitting = form.formState.isSubmitting;
    return (
      <Card className="p-6">
        <div className="mb-4 font-display text-lg font-extrabold text-foreground">
          Edit patient
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive-surface px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Not provided" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  form.reset();
                  setFormError(null);
                  setEditing(false);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div className="font-display text-lg font-extrabold text-foreground">
          Patient info
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil size={14} />
          Edit
        </Button>
      </div>
      <InfoRow icon={Mail} label="Email" value={patient.email} />
      <InfoRow icon={Phone} label="Phone" value={patient.phone ?? "Not provided"} />
      <InfoRow
        icon={Package}
        label="Box number"
        value={patient.boxNumber ?? "No box associated"}
      />
      <InfoRow icon={CalendarPlus} label="Registered" value={patient.registeredLabel} />
    </Card>
  );
}
