
// for SignIn and SignUp: send to retrieve tokens
export async function apiClient({endpoint = null, payload = null} = {}) {
    if (payload) {
        const response = await fetch(`http://localhost:8000${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
        });
        return response
    }
    // for accounts/me
    const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "GET",
        credentials: "include",
    });
    return response
}

// for protected endpoint
export async function authenticatedClient({ endpoint = null, payload = null} = {}) {
    if (payload) {
        const response = await fetch(`http://localhost:8000${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            credentials: "include",
            body: JSON.stringify(payload),
        });
        return response
    }

    const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "GET",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
    });
    return response
}

export async function authenticatedClientWithRetry(endpoint, payload, isActive, navigate, setSymbol) {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(payload),
    });

    /*TODO: server job! get new tokens if access expires*/
    if (!response.ok) {
        if (response.status === 403) { /*Unauthorized user, aka, don't have permission to use*/
            navigate("/account");
        } else if (response.status === 401) {
            navigate("/sign-up");
        } else if (response.status == 400) {
            setSymbol("");
        } else if (response.status == 503 && isActive()) {
            // retry again after the "Retry-After"
            const retryAfter = response.headers.get('Retry-After');
            console.log("retryAfter:", retryAfter);
            if (retryAfter) {
                const delay = parseInt(retryAfter);
                console.log("retrying...")
                await new Promise(resolve => setTimeout(resolve, delay));
                return authenticatedClientWithRetry(endpoint, payload, isActive, navigate, setSymbol)
            }
        }
    }
    
    return response
}

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}