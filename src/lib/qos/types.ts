export type CheckoutPaymentOutcomeStatus =
  | "pending"
  | "provider_handoff"
  | "unknown"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired";

export type CheckoutPaymentOutcomeMessaging = {
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
};

export type CheckoutPaymentOutcomeLine = {
  linePublicId: string;
  productPublicId: string;
  displayNameEn: string;
  displayNameAr: string;
  quantity: number;
  unitPrice: {
    amountMinor: number;
    currency: string;
  };
  lineTotalMinor: number;
};

export type CheckoutPaymentOutcomeResponse = {
  contractVersion: 1;
  paymentAttemptPublicId: string;
  status: CheckoutPaymentOutcomeStatus;
  isTest: true;
  provider: "stripe";
  providerMode: "sandbox" | "fixture";
  quotePublicId: string;
  currency: "AED";
  totalMinor: number;
  lines: CheckoutPaymentOutcomeLine[];
  fees: Array<{
    kind: "service" | "delivery";
    labelEn: string;
    labelAr: string;
    amountMinor: number;
  }>;
  discountMinor: number;
  vatMinor: number;
  providerReference?: string;
  reconciledAt?: string;
  messaging: CheckoutPaymentOutcomeMessaging;
  diagnostics?: {
    lastEventType?: string;
    lastProviderEventId?: string;
    isLabelledFixture?: boolean;
  };
};

export type CheckoutOutcomeApiResponse = {
  outcome: CheckoutPaymentOutcomeResponse;
};

export type CheckoutOutcomeApiError = {
  error: string;
  field?: string;
};

export const PENDING_CHECKOUT_OUTCOME_STATUSES = new Set<CheckoutPaymentOutcomeStatus>([
  "pending",
  "provider_handoff",
  "unknown",
]);

export const TERMINAL_CHECKOUT_OUTCOME_STATUSES = new Set<CheckoutPaymentOutcomeStatus>([
  "succeeded",
  "failed",
  "cancelled",
  "expired",
]);

export type QosApiError = {
  error: string;
  field?: string;
};

export type CustomerMeResponse = {
  customer: {
    contractVersion: 1;
    customerUserId: string;
    email: string;
    name: string;
    emailVerified: boolean;
    storefrontPublicId: string;
    tenantPublicId: string;
    associationStatus: string;
  };
};

export type BasketLineResponse = {
  linePublicId: string;
  productPublicId: string;
  quantity: number;
  unitPrice: {
    amountMinor: number;
    currency: string;
  };
};

export type BasketContextResponse = {
  contractVersion: 1;
  basketPublicId: string;
  version: number;
  tenantPublicId: string;
  storefrontPublicId: string;
  locationPublicId: string;
  menuPublicId: string;
  menuReleaseVersion: number;
  currency: string;
  locale: "en" | "ar";
  lines: BasketLineResponse[];
  itemCount: number;
  provisionalSubtotalMinor: number;
  ownership: "anonymous" | "account";
};

export type AccountBasketResponse = {
  basket: BasketContextResponse;
};

export type AnonymousBasketResponse = {
  basket: BasketContextResponse;
};

export type BasketMergeDecision =
  | "keep_account"
  | "replace_with_anonymous"
  | "merge";

export type BasketMergeLineValidationStatus =
  | "ok"
  | "unavailable"
  | "price_changed"
  | "quantity_exceeds_limit";

export type BasketMergeLineValidation = {
  productPublicId: string;
  source: "anonymous" | "account" | "both";
  status: BasketMergeLineValidationStatus;
  storedUnitPrice?: BasketLineResponse["unitPrice"];
  currentUnitPrice?: BasketLineResponse["unitPrice"];
  combinedQuantity?: number;
  maxLineQuantity?: number;
};

export type BasketMergePreviewResponse = {
  contractVersion: 1;
  anonymousBasket: BasketContextResponse & { ownership: "anonymous" };
  accountBasket: BasketContextResponse & { ownership: "account" };
  lineValidations: BasketMergeLineValidation[];
  availableDecisions: readonly BasketMergeDecision[];
  decisionPayloadHashes: Record<BasketMergeDecision, string>;
  proposedOutcomes: Record<BasketMergeDecision, BasketContextResponse & { ownership: "account" }>;
};

export type BasketMergePreviewApiResponse = {
  preview: BasketMergePreviewResponse;
};

export type BasketMergeCommitResponse = {
  contractVersion: 1;
  decision: BasketMergeDecision;
  operationId: string;
  accountBasket: BasketContextResponse & { ownership: "account" };
  anonymousBasketRetired: true;
};

export type BasketMergeCommitApiResponse = {
  merge: BasketMergeCommitResponse;
};

export type CheckoutQuoteResponse = {
  quote: {
    contractVersion: 1;
    quotePublicId: string;
    version: number;
    currency: "AED";
    totalMinor: number;
    lines: CheckoutPaymentOutcomeLine[];
  };
};

export type CheckoutPaymentHandoffResponse = {
  kind: "hosted_checkout_url" | "fixture";
  url: string;
  sessionId: string;
  isLabelledFixture: boolean;
};

export type CheckoutPaymentAttemptResponse = {
  paymentAttempt: {
    contractVersion: 1;
    paymentAttemptPublicId: string;
    status: "provider_handoff" | "pending" | "unknown";
    quotePublicId: string;
    quoteVersion: number;
    totalMinor: number;
    currency: "AED";
    isTest: true;
    provider: "stripe";
    providerMode: "sandbox" | "fixture";
    handoff: CheckoutPaymentHandoffResponse;
  };
};
