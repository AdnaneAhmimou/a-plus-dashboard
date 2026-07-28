import { describe, expect, it } from "vitest";
import {
  registerSchema,
  registerFormSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/lib/auth/validation";

describe("registerSchema", () => {
  const valid = {
    email: "Patient@Example.com",
    password: "GoodPass1",
    firstName: "Jane",
    lastName: "Doe",
    boxNumber: "APL-00482",
  };

  it("accepts a valid payload and normalizes the email", () => {
    const result = registerSchema.parse(valid);
    expect(result.email).toBe("patient@example.com");
  });

  it("rejects a password without an uppercase letter", () => {
    const result = registerSchema.safeParse({ ...valid, password: "goodpass1" });
    expect(result.success).toBe(false);
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse({ ...valid, password: "GoodPassword" });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...valid, password: "Pass1" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing first name", () => {
    const result = registerSchema.safeParse({ ...valid, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing box number", () => {
    const result = registerSchema.safeParse({ ...valid, boxNumber: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerFormSchema", () => {
  const valid = {
    email: "patient@example.com",
    password: "GoodPass1",
    confirmPassword: "GoodPass1",
    firstName: "Jane",
    lastName: "Doe",
    boxNumber: "APL-00482",
  };

  it("accepts matching password and confirmPassword", () => {
    const result = registerFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched confirmPassword and flags the confirmPassword field", () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      confirmPassword: "SomethingElse1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeTruthy();
    }
  });
});

describe("loginSchema", () => {
  it("accepts any non-empty password (no complexity check on login)", () => {
    const result = loginSchema.safeParse({
      email: "patient@example.com",
      password: "x",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "patient@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires both token and a strong password", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "GoodPass1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "GoodPass1",
    });
    expect(result.success).toBe(false);
  });
});
