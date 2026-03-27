import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type Lead = {
  id: number;
  fullName: string;
  whatsapp: string;
  city: string;
  interest: string | null;
  createdAt: Date;
};

export default function AdminLeads() {
  const { user, isAuthenticated, loading } = useAuth();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterInterest, setFilterInterest] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const limit = 20;

  // Determine which query to use
  const hasFilters: boolean = !!(filterCity || filterInterest || startDate || endDate);
  const isSearching: boolean = searchQuery.trim().length > 0;

  const listQuery = trpc.leads.list.useQuery(
    { page, limit },
    { enabled: (!hasFilters && !isSearching && isAuthenticated) as boolean }
  );

  const searchQueryResult = trpc.leads.search.useQuery(
    { query: searchQuery, page, limit },
    { enabled: (isSearching && isAuthenticated) as boolean }
  );

  const filterQueryResult = trpc.leads.filter.useQuery(
    {
      city: filterCity || undefined,
      interest: filterInterest || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    },
    { enabled: (hasFilters && isAuthenticated) as boolean }
  );

  const handleExportFn = async () => {
    try {
      const input = {
        format: exportFormat,
        city: filterCity || undefined,
        interest: filterInterest || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };
      const response = await fetch(
        `/api/trpc/leads.export?input=${encodeURIComponent(JSON.stringify(input))}`
      );
      const result = await response.json();
      const data = result.result?.data;
      if (!data) throw new Error("Resposta inválida do servidor");
      const element = document.createElement("a");
      const file = new Blob([data.data], { type: exportFormat === "csv" ? "text/csv" : "application/json" });
      element.href = URL.createObjectURL(file);
      element.download = data.filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Arquivo ${data.filename} baixado com sucesso!`);
      setIsExporting(false);
    } catch (err) {
      toast.error("Erro ao exportar dados");
      console.error(err);
      setIsExporting(false);
    }
  };

  // Select appropriate data
  let leads: Lead[] = [];
  let total = 0;
  let pages = 1;
  let isLoading = false;

  if (isSearching) {
    leads = searchQueryResult.data?.leads ?? [];
    isLoading = searchQueryResult.isLoading;
  } else if (hasFilters) {
    leads = filterQueryResult.data?.leads ?? [];
    isLoading = filterQueryResult.isLoading;
  } else {
    leads = listQuery.data?.leads ?? [];
    total = listQuery.data?.total ?? 0;
    pages = listQuery.data?.pages ?? 1;
    isLoading = listQuery.isLoading;
  }

  const handleExport = async () => {
    setIsExporting(true);
    await handleExportFn();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterCity("");
    setFilterInterest("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Check authorization
  if (!loading && (!isAuthenticated || user?.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <h1 className="font-heading text-4xl font-light mb-4" style={{ color: "var(--charcoal)" }}>
            Acesso Negado
          </h1>
          <p className="text-base mb-8" style={{ color: "oklch(0.45 0.01 30)" }}>
            Você não tem permissão para acessar este painel. Apenas administradores podem visualizar os leads.
          </p>
          <a
            href="/"
            className="btn-gold"
          >
            Voltar para Home
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
          <p className="text-base" style={{ color: "oklch(0.45 0.01 30)" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 py-6 px-6" style={{ background: "white", borderBottom: "1px solid oklch(0.93 0.005 85)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-3xl font-light" style={{ color: "var(--charcoal)" }}>
                Painel de Leads
              </h1>
              <p className="text-sm mt-1" style={{ color: "oklch(0.5 0.01 30)" }}>
                Total de leads: <strong>{total}</strong>
              </p>
            </div>
            <a href="/" className="text-sm font-700 px-4 py-2 rounded-lg transition-all" style={{ color: "var(--gold)", border: "1px solid var(--gold)" }} onMouseEnter={e => { (e.target as HTMLElement).style.background = "var(--gold-light)"; }} onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; }}>
              ← Voltar
            </a>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por nome, WhatsApp ou cidade..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{
                border: "1.5px solid oklch(0.91 0.006 85)",
                background: "white",
                color: "var(--charcoal)",
              }}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-700 mb-1 block" style={{ color: "var(--charcoal)" }}>
                Cidade
              </label>
              <input
                type="text"
                placeholder="Filtrar por cidade"
                value={filterCity}
                onChange={(e) => {
                  setFilterCity(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all"
                style={{
                  border: "1.5px solid oklch(0.91 0.006 85)",
                  background: "white",
                  color: "var(--charcoal)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--gold)"}
                onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
              />
            </div>
            <div>
              <label className="text-xs font-700 mb-1 block" style={{ color: "var(--charcoal)" }}>
                Interesse
              </label>
              <select
                value={filterInterest}
                onChange={(e) => {
                  setFilterInterest(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all"
                style={{
                  border: "1.5px solid oklch(0.91 0.006 85)",
                  background: "white",
                  color: filterInterest ? "var(--charcoal)" : "oklch(0.6 0.01 30)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--gold)"}
                onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
              >
                <option value="">Todos os interesses</option>
                <option value="Facetas de Resina Composta">Facetas de Resina Composta</option>
                <option value="Clareamento Dental">Clareamento Dental</option>
                <option value="Design do Sorriso">Design do Sorriso</option>
                <option value="Outros procedimentos estéticos">Outros procedimentos estéticos</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-700 mb-1 block" style={{ color: "var(--charcoal)" }}>
                De
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all"
                style={{
                  border: "1.5px solid oklch(0.91 0.006 85)",
                  background: "white",
                  color: "var(--charcoal)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--gold)"}
                onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
              />
            </div>
            <div>
              <label className="text-xs font-700 mb-1 block" style={{ color: "var(--charcoal)" }}>
                Até
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all"
                style={{
                  border: "1.5px solid oklch(0.91 0.006 85)",
                  background: "white",
                  color: "var(--charcoal)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--gold)"}
                onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-700 transition-all"
                style={{
                  background: "oklch(0.96 0.005 85)",
                  color: "var(--charcoal)",
                  border: "1px solid oklch(0.91 0.006 85)",
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = "oklch(0.93 0.005 85)"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "oklch(0.96 0.005 85)"; }}
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="mt-4 flex gap-2 items-center">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as "csv" | "json")}
              className="px-3 py-2 rounded-lg text-xs outline-none"
              style={{
                border: "1.5px solid oklch(0.91 0.006 85)",
                background: "white",
                color: "var(--charcoal)",
              }}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleExport}
              disabled={isExporting || leads.length === 0}
              className="btn-gold text-xs px-4 py-2"
              style={{ opacity: isExporting || leads.length === 0 ? 0.6 : 1 }}
            >
              {isExporting ? "Exportando..." : "📥 Exportar"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
              <p className="text-base" style={{ color: "oklch(0.45 0.01 30)" }}>Carregando leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 card-premium">
              <p className="text-base mb-4" style={{ color: "oklch(0.45 0.01 30)" }}>
                Nenhum lead encontrado com os filtros selecionados.
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-gold text-xs"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <>
              {/* Table - Desktop */}
              <div className="hidden md:block card-premium overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: "oklch(0.97 0.005 85)" }}>
                        <th className="px-6 py-4 text-left font-heading text-sm font-600" style={{ color: "var(--charcoal)" }}>
                          Nome
                        </th>
                        <th className="px-6 py-4 text-left font-heading text-sm font-600" style={{ color: "var(--charcoal)" }}>
                          WhatsApp
                        </th>
                        <th className="px-6 py-4 text-left font-heading text-sm font-600" style={{ color: "var(--charcoal)" }}>
                          Cidade
                        </th>
                        <th className="px-6 py-4 text-left font-heading text-sm font-600" style={{ color: "var(--charcoal)" }}>
                          Interesse
                        </th>
                        <th className="px-6 py-4 text-left font-heading text-sm font-600" style={{ color: "var(--charcoal)" }}>
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, i) => (
                        <tr
                          key={lead.id}
                          style={{
                            borderTop: i > 0 ? "1px solid oklch(0.93 0.005 85)" : "none",
                          }}
                        >
                          <td className="px-6 py-4 text-sm" style={{ color: "var(--charcoal)" }}>
                            {lead.fullName}
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: "oklch(0.45 0.01 30)" }}>
                            <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", textDecoration: "underline" }}>
                              {lead.whatsapp}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: "oklch(0.45 0.01 30)" }}>
                            {lead.city}
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: "oklch(0.45 0.01 30)" }}>
                            {lead.interest ? (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-700" style={{ background: "var(--gold-light)", color: "var(--charcoal)" }}>
                                {lead.interest}
                              </span>
                            ) : (
                              <span style={{ color: "oklch(0.65 0.01 30)" }}>-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: "oklch(0.45 0.01 30)" }}>
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards - Mobile */}
              <div className="md:hidden space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="card-premium p-4">
                    <div className="mb-3">
                      <p className="font-heading font-600 text-sm" style={{ color: "var(--charcoal)" }}>
                        {lead.fullName}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "oklch(0.5 0.01 30)" }}>
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span style={{ color: "oklch(0.5 0.01 30)" }}>WhatsApp: </span>
                        <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", textDecoration: "underline" }}>
                          {lead.whatsapp}
                        </a>
                      </p>
                      <p>
                        <span style={{ color: "oklch(0.5 0.01 30)" }}>Cidade: </span>
                        <span style={{ color: "var(--charcoal)" }}>{lead.city}</span>
                      </p>
                      {lead.interest && (
                        <p>
                          <span style={{ color: "oklch(0.5 0.01 30)" }}>Interesse: </span>
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-700" style={{ background: "var(--gold-light)", color: "var(--charcoal)" }}>
                            {lead.interest}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {!isSearching && !hasFilters && pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg text-sm font-700 transition-all"
                    style={{
                      background: page === 1 ? "oklch(0.96 0.005 85)" : "white",
                      color: page === 1 ? "oklch(0.6 0.01 30)" : "var(--charcoal)",
                      border: "1px solid oklch(0.91 0.006 85)",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ← Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className="w-10 h-10 rounded-lg text-sm font-700 transition-all"
                        style={{
                          background: page === i + 1 ? "var(--gold)" : "white",
                          color: page === i + 1 ? "white" : "var(--charcoal)",
                          border: "1px solid oklch(0.91 0.006 85)",
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(pages, page + 1))}
                    disabled={page === pages}
                    className="px-4 py-2 rounded-lg text-sm font-700 transition-all"
                    style={{
                      background: page === pages ? "oklch(0.96 0.005 85)" : "white",
                      color: page === pages ? "oklch(0.6 0.01 30)" : "var(--charcoal)",
                      border: "1px solid oklch(0.91 0.006 85)",
                      cursor: page === pages ? "not-allowed" : "pointer",
                    }}
                  >
                    Próximo →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
