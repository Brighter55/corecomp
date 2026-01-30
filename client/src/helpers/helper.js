
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
