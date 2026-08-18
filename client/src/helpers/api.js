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

// for protected endpoint
export async function authenticatedClient({ endpoint = null, payload = null} = {}) {
    if (payload) {
        const response = await fetch(`${backendBaseUrl}${endpoint}`, {
            method: "POST",
            headers: buildHeaders({
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }),
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

export async function authenticatedClientWithRetry(endpoint, payload, isActive, navigate, setSymbol) {
    const response = await fetch(`${backendBaseUrl}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: buildHeaders({
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        }),
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
        } else if (response.status == 503 && isActive()) {
            // retry again after the "Retry-After"
            const retryAfter = response.headers.get('Retry-After');
            if (retryAfter) {
                const delay = parseInt(retryAfter);
                await new Promise(resolve => setTimeout(resolve, delay));
                return authenticatedClientWithRetry(endpoint, payload, isActive, navigate, setSymbol)
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