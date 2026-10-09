"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";

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
import { createBoxSchema, type CreateBoxInput } from "@/lib/admin/validation";
import { ApiError, postJson } from "@/lib/auth/api-client";

export function AddBoxForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateBoxInput>({
    resolver: zodResolver(createBoxSchema),
    defaultValues: { number: "" },
  });

  async function onSubmit(values: CreateBoxInput) {
    setFormError(null);
    try {
      await postJson("/api/admin/boxes", values);
      form.reset();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-start gap-3"
        noValidate
      >
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem className="w-64">
              <FormLabel className="sr-only">Box number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. APL-00483" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : <Plus size={16} />}
          Add box
        </Button>
      </form>
      {formError && (
        <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
          {formError}
        </p>
      )}
    </Form>
  );
}
