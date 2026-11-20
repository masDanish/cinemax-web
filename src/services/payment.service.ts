import type { ApiClient } from "@/lib/api";
import type { CheckoutResponse } from "@/types/api";

export function createPaymentService(client: ApiClient) {
  return {
    /**
     * POST /api/payments/checkout (login, hanya pemilik reservasi).
     * Hanya membuat Stripe Checkout Session. Reservasi baru CONFIRMED setelah
     * backend memproses webhook Stripe, jadi status harus dicek lewat
     * reservationService.get().
     */
    checkout: (reservationId: string) =>
      client.post<CheckoutResponse>("/payments/checkout", { reservationId }),
  };
}
