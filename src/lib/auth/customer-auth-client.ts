import { QosRequestError } from "@/lib/qos/api-client";
import { buildAuthCallbackUrl, resolveSafeReturnPath } from "@/lib/auth/return-url";

export type CustomerOAuthProvider = "google" | "microsoft";

export type AuthUserPayload = {
  id: string;
  email: string;
  name?: string | null;
  emailVerified: boolean;
};

type AuthActionResponse = {
  user?: AuthUserPayload;
  token?: string;
  redirect?: boolean;
  url?: string;
  error?: string;
  message?: string;
};

export async function signInWithEmail(input: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  const response = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      rememberMe: input.rememberMe ?? true,
    }),
  });

  const payload = (await response.json()) as AuthActionResponse;

  if (!response.ok) {
    throw new QosRequestError(
      payload.error || payload.message || "Authentication failed.",
      response.status,
    );
  }

  return payload;
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  name: string;
}) {
  const response = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as AuthActionResponse;

  if (!response.ok) {
    throw new QosRequestError(
      payload.error || payload.message || "Registration failed.",
      response.status,
    );
  }

  return payload;
}

const PENDING_MERGE_CHECK_KEY = "qos-pending-merge-check";

export async function signInWithSocial(
  provider: CustomerOAuthProvider,
  returnPath: string,
) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(PENDING_MERGE_CHECK_KEY, resolveSafeReturnPath(returnPath));
  }

  const callbackURL = buildAuthCallbackUrl(returnPath);
  const response = await fetch("/api/auth/sign-in/social", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      provider,
      callbackURL,
      disableRedirect: true,
    }),
  });

  const payload = (await response.json()) as AuthActionResponse;

  if (!response.ok) {
    throw new QosRequestError(
      payload.error || payload.message || "Social sign-in failed.",
      response.status,
    );
  }

  if (payload.url) {
    window.location.assign(payload.url);
    return;
  }

  if (payload.redirect) {
    window.location.assign(callbackURL);
    return;
  }

  throw new QosRequestError("Social sign-in did not return a provider URL.", 502);
}

export async function signOutCustomer() {
  const response = await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!response.ok) {
    const payload = (await response.json()) as AuthActionResponse;
    throw new QosRequestError(
      payload.error || payload.message || "Sign-out failed.",
      response.status,
    );
  }
}

export async function requestPasswordReset(email: string, returnPath = "/reset-password") {
  const redirectTo = buildAuthCallbackUrl(returnPath);

  const response = await fetch("/api/auth/request-password-reset", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, redirectTo }),
  });

  const payload = (await response.json()) as AuthActionResponse;

  if (!response.ok) {
    throw new QosRequestError(
      payload.error || payload.message || "Password reset request failed.",
      response.status,
    );
  }

  return payload;
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as AuthActionResponse;

  if (!response.ok) {
    throw new QosRequestError(
      payload.error || payload.message || "Password reset failed.",
      response.status,
    );
  }

  return payload;
}

export function readOAuthProvidersFromEnv(raw: string | undefined) {
  const allowed = new Set<CustomerOAuthProvider>(["google", "microsoft"]);

  return (raw ?? "google,microsoft")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry): entry is CustomerOAuthProvider => allowed.has(entry as CustomerOAuthProvider));
}

export function buildSignInHref(returnPath?: string | null) {
  const safePath = resolveSafeReturnPath(returnPath);
  return `/sign-in?returnTo=${encodeURIComponent(safePath)}`;
}
