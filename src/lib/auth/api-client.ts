export interface ApiErrorBody {
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export class ApiError extends Error {
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = data as ApiErrorBody;
    throw new ApiError(err.error || "Something went wrong", err.fieldErrors);
  }

  return data as T;
}

// Deliberately no Content-Type header — the browser sets
// multipart/form-data with the correct boundary itself, which is lost if
// you set it manually on a FormData body.
export async function postFormData<T>(url: string, body: FormData): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    body,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = data as ApiErrorBody;
    throw new ApiError(err.error || "Something went wrong", err.fieldErrors);
  }

  return data as T;
}
