import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function errorResponse(message: string, status: number, fieldErrors?: Record<string, string[] | undefined>) {
  return NextResponse.json({ error: message, fieldErrors }, { status });
}

export function zodErrorResponse(error: ZodError) {
  return errorResponse("Validation failed", 400, error.flatten().fieldErrors);
}
