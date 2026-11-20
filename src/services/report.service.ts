import type { ApiClient } from "@/lib/api";
import type { Report, ReportQuery } from "@/types/api";

export function createReportService(client: ApiClient) {
  return {
    /**
     * GET /api/reports?from&to (ADMIN). Rentang dihitung terhadap startsAt jadwal.
     * Kirim ISO lengkap (lihat dayRangeIso) agar hari terakhir tidak terpotong.
     */
    get: (query: ReportQuery = {}) => client.get<Report>("/reports", { query: { ...query } }),
  };
}
