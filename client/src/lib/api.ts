const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type CreatePaymentRequest = {
  firstName: string;
  lastName: string;
  expiry: string;
  cvv: string;
  cardNumber: string;
};

export type CreatePaymentResponse = {
  id: string;
  status: "CREATED" | string;
  createdAt: string;
};

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
};

export async function postPayment(
  idempotencyKey: string,
  payload: CreatePaymentRequest,
): Promise<CreatePaymentResponse> {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorBody: ApiErrorResponse | undefined;
    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      // Preserve a safe fallback when the backend response is not JSON.
    }

    throw new ApiClientError(
      errorBody?.message ?? `Payment request failed with status ${response.status}`,
      response.status,
      errorBody,
    );
  }

  return (await response.json()) as CreatePaymentResponse;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody?: ApiErrorResponse,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export const api = {
  postPayment,
};
