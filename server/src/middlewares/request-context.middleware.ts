import type { Response } from "express";

export function requireCurrentUserId(res: Response): number {
  const rawUserId = res.req.header("x-user-id");

  const userId = Number(rawUserId);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("USER_CONTEXT_REQUIRED");
  }

  return userId;
}
