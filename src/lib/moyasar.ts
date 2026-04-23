/**
 * Moyasar payment gateway integration.
 *
 * Docs: https://docs.moyasar.com/
 *
 * Flow used by this app:
 * 1. Client loads Moyasar.js with the publishable key and tokenizes the card.
 * 2. Server creates the payment via POST /v1/payments using the secret key.
 * 3. Server polls the payment status or receives a webhook, then marks the
 *    order as PAID and creates Enrollment records for all courses in the
 *    order.
 *
 * This module hides the HTTP details so the rest of the app can call
 * `createPayment(...)` / `fetchPayment(...)` without worrying about Moyasar
 * specifics.
 */

const MOYASAR_API = "https://api.moyasar.com/v1";

function authHeader() {
  const key = process.env.MOYASAR_SECRET_KEY || "";
  return "Basic " + Buffer.from(key + ":").toString("base64");
}

export interface MoyasarPayment {
  id: string;
  status: string; // initiated | paid | failed | authorized | captured
  amount: number;
  currency: string;
  description?: string;
  source?: Record<string, unknown>;
  metadata?: Record<string, string>;
  created_at: string;
}

export interface CreatePaymentInput {
  amount: number; // amount in minor units (halalas for SAR)
  currency?: string;
  description?: string;
  source: Record<string, unknown>; // usually { type: 'token', token: 'xxx' }
  callback_url?: string;
  metadata?: Record<string, string>;
}

export async function createPayment(
  input: CreatePaymentInput,
): Promise<MoyasarPayment> {
  const res = await fetch(`${MOYASAR_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currency: "SAR",
      ...input,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Moyasar create payment failed: ${res.status} ${text}`);
  }
  return (await res.json()) as MoyasarPayment;
}

export async function fetchPayment(id: string): Promise<MoyasarPayment> {
  const res = await fetch(`${MOYASAR_API}/payments/${id}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Moyasar fetch payment failed: ${res.status} ${text}`);
  }
  return (await res.json()) as MoyasarPayment;
}
