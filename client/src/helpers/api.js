
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

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}