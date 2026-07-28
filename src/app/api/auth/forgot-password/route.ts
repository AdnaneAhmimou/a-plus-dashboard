import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { errorResponse, zodErrorResponse } from "@/lib/api-response";

const RESET_TOKEN_TTL_MINUTES = 30;

// Always returns a generic success message so we never reveal whether an
// email address is registered (prevents account enumeration).
const GENERIC_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return errorResponse("Invalid JSON body", 400);

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = generateOpaqueToken();
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
      },
    });

    // TODO: wire up transactional email (e.g. via a provider like Resend/SES)
    // to send `token` as a reset link: /reset-password?token=<token>
    if (process.env.NODE_ENV !== "production") {
      console.info(`[dev] Password reset token for ${email}: ${token}`);
    }
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
