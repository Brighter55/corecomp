
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
