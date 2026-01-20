
export async function checkPermission(navigate) {
    const response = await fetch("http://127.0.0.1:8000/accounts/check-permission", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
        },
    });
    const data = await response.json();

    /*get new tokens if access expires*/
    if (!response.ok) {
        if (data?.messages?.[0]?.message === "Token is expired") {
            const response = await fetch("http://127.0.0.1:8000/accounts/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({refresh: sessionStorage.getItem("refresh")})
            });
            if (!response.ok) { /*Refresh expires in general needs log in again*/
                console.log("refresh is invalid");
                navigate("/sign-in");
                return;
            }

            const data = await response.json();
            sessionStorage.setItem("access", data.access);
            sessionStorage.setItem("refresh", data.refresh);
            console.log(`recieved new pair of tokens. {access: ${sessionStorage.getItem("access")}, refresh: ${sessionStorage.getItem("refresh")}`);
        } else {
            navigate("/sign-up");
        }
    }

    const permission = data.permission;
    if (permission === "IsAuthenticated") {
        navigate("/user-account");
    }
}

export async function getNewTokens(data, navigate) {
    const refreshResponse = await fetch("http://127.0.0.1:8000/accounts/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({refresh: sessionStorage.getItem("refresh")})
    });
    if (!refreshResponse.ok) { /*Refresh expires in general needs log in again*/
        console.log("refresh is invalid");
        navigate("/sign-in");
        return;
    }

    const tokens = await refreshResponse.json();
    sessionStorage.setItem("access", tokens.access);
    sessionStorage.setItem("refresh", tokens.refresh);
    console.log(`recieved new pair of tokens. {access: ${sessionStorage.getItem("access")}, refresh: ${sessionStorage.getItem("refresh")}`);
}

export async function fetchSymbolDataWithRetry(url, payload, isActive, navigate, setSymbol) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
        },
        body: JSON.stringify(payload),
    });

    /*TODO: server job! get new tokens if access expires*/
    if (!response.ok) {
        if (response.status === 403) { /*Unauthorized user, aka, don't have permission to use*/
            navigate("/user-account");
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
                return fetchSymbolDataWithRetry(url, payload, isActive, navigate, setSymbol)
            }
        }
    }
    return response
}
