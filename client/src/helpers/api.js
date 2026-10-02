const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

// persistent anonymous session id so the server can enforce the free-trial quota
function getAnonymousSessionId() {
  let id = localStorage.getItem("corecomp_anonymous_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("corecomp_anonymous_session_id", id);
  }
  return id;
}

function buildHeaders(extra = {}) {
  return {
    "X-Anonymous-Session": getAnonymousSessionId(),
    ...extra,
  };
}

// POST headers: only send X-CSRFToken when a csrftoken cookie actually exists
// (never send the literal string "undefined").
function buildPostHeaders() {
  const headers = buildHeaders({
    "Content-Type": "application/json",
  });
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }
  return headers;
}

// for protected endpoint
export async function authenticatedClient({ endpoint = null, payload = null} = {}) {
    if (payload) {
        const response = await fetch(`${backendBaseUrl}${endpoint}`, {
            method: "POST",
            headers: buildPostHeaders(),
            credentials: "include",
            body: JSON.stringify(payload),
        });
        return response
    }

    const response = await fetch(`${backendBaseUrl}${endpoint}`, {
        method: "GET",
        headers: buildHeaders(),
        credentials: "include",
    });
    return response
}

// A persistent 503 must not retry forever. Two extra attempts is a judgement
// call; the property that matters is that the call always SETTLES, so callers
// see the 503 instead of waiting on a promise that never resolves.
const MAX_RETRIES = 2;

// Bounds an absurd Retry-After. Deliberately not lower than what the backend
// actually sends ("60000", milliseconds), so a real value is never shortened.
const MAX_RETRY_DELAY_MS = 60_000;

export async function authenticatedClientWithRetry(endpoint, payload, isActive, navigate, setSymbol, attempt = 0) {
    const response = await fetch(`${backendBaseUrl}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: buildPostHeaders(),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status === 403) { /*free-trial quota exceeded*/
            let detail = null;
            try {
                if (typeof response.clone === "function") {
                    detail = (await response.clone().json()).detail;
                }
            } catch {
                detail = null;
            }
            if (detail === "quota_exceeded") {
                navigate("/login", { state: { message: "You've used all 5 free searches for this month. Sign in to continue." } });
            } else {
                navigate("/login");
            }
        } else if (response.status === 401) {
            navigate("/login");
        } else if (response.status == 400) {
            setSymbol("");
        } else if (response.status == 503 && isActive() && attempt < MAX_RETRIES) {
            // retry again after the "Retry-After"
            const retryAfter = response.headers.get('Retry-After');
            // parseInt("") and parseInt("soon") are NaN, and setTimeout(NaN) fires
            // immediately -- which is a tight loop, not a backoff. Guard it.
            const delay = Number.parseInt(retryAfter ?? "", 10);
            if (Number.isFinite(delay) && delay >= 0) {
                await new Promise(resolve => setTimeout(resolve, Math.min(delay, MAX_RETRY_DELAY_MS)));
                return authenticatedClientWithRetry(endpoint, payload, isActive, navigate, setSymbol, attempt + 1)
            }
        }
    }

    return response;
}

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}