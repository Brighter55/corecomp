import { authenticatedClient, authenticatedClientUpload } from "../helpers/api.js";

export async function fetchLedger() {
  const response = await authenticatedClient({ endpoint: "/portfolio/transactions" });
  if (!response.ok) throw new Error("Could not load your trades.");
  return response.json();
}

export async function fetchAnalysis({ benchmark } = {}) {
  const params = new URLSearchParams();
  if (benchmark) params.set("benchmark", benchmark);
  const query = params.toString();
  const response = await authenticatedClient({
    endpoint: `/portfolio/analysis${query ? `?${query}` : ""}`,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Could not load your portfolio.");
  }
  return response.json();
}

export async function saveTransaction(payload) {
  const response = await authenticatedClient({
    endpoint: "/portfolio/transactions",
    payload,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const first = body.symbol?.[0] || body.amount?.[0] || body.trade_date?.[0];
    throw new Error(first || body.error || "Could not save that trade.");
  }
  return response.json();
}

export async function deleteTransaction(id) {
  const response = await authenticatedClient({
    endpoint: "/portfolio/transactions/delete",
    payload: { id },
  });
  if (!response.ok) throw new Error("Could not delete that trade.");
  return response.json();
}

export async function fetchSplits() {
  const response = await authenticatedClient({ endpoint: "/portfolio/splits" });
  if (!response.ok) throw new Error("Could not load your splits.");
  return response.json();
}

export async function saveSplit(payload) {
  const response = await authenticatedClient({
    endpoint: "/portfolio/splits",
    payload,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const first =
      body.symbol?.[0] ||
      body.effective_date?.[0] ||
      body.numerator?.[0] ||
      body.denominator?.[0];
    throw new Error(first || body.error || "Could not save that split.");
  }
  return response.json();
}

export async function deleteSplit(id) {
  const response = await authenticatedClient({
    endpoint: "/portfolio/splits/delete",
    payload: { id },
  });
  if (!response.ok) throw new Error("Could not delete that split.");
  return response.json();
}

export async function importActivity(file, { dryRun = false } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dry_run", dryRun ? "true" : "false");
  const response = await authenticatedClientUpload({
    endpoint: "/portfolio/import",
    formData,
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 409) {
    throw new Error("This file was already imported.");
  }
  if (!response.ok) throw new Error(body.error || "Could not import that file.");
  return body;
}
