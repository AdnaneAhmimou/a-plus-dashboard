import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/prisma-mock";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET } from "@/app/api/results/ancestry/route";
import { signAccessToken } from "@/lib/auth/jwt";

describe("GET /api/results/ancestry", () => {
  beforeEach(() => resetPrismaMock());

  it("requires authentication", async () => {
    expect((await GET(new NextRequest("http://localhost/api/results/ancestry"))).status).toBe(401);
  });

  it("returns only the authenticated patient's ancestry profile", async () => {
    const token = await signAccessToken({ sub: "user_1", email: "patient@example.com", role: "PATIENT" });
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", box: { id: "box_1" } });
    prismaMock.ancestryProfile.findUnique.mockResolvedValue({
      composition: [{ region: "Europe", percent: 72 }],
      maternalHaplogroup: "H",
      maternalSubhaplogroup: "H1",
      maternalMigration: [{ era: "10,000 years ago", haplogroup: "H" }],
      paternalHaplogroup: "R1b",
      paternalSubhaplogroup: null,
      paternalMigration: [],
      neanderthalPercent: 1.8,
      neanderthalVariants: 418,
      neanderthalVsAverage: 5.2,
      neanderthalSections: [],
    });

    const response = await GET(new NextRequest("http://localhost/api/results/ancestry", { headers: { cookie: `access_token=${token}` } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ maternalHaplogroup: "H", neanderthalPercent: 1.8 });
    expect(prismaMock.ancestryProfile.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { boxId: "box_1" } }));
  });

  it("returns 404 when the patient has no ancestry profile", async () => {
    const token = await signAccessToken({ sub: "user_1", email: "patient@example.com", role: "PATIENT" });
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", box: { id: "box_1" } });
    prismaMock.ancestryProfile.findUnique.mockResolvedValue(null);
    const response = await GET(new NextRequest("http://localhost/api/results/ancestry", { headers: { cookie: `access_token=${token}` } }));
    expect(response.status).toBe(404);
  });
});
