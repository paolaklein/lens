/**
 * This stores the current access token used to authenticate with the backend services.
 * NOTE: This is not a general solution and is tailored for deployment with oauth2-proxy.
 */
import { writable } from "svelte/store";

export const authStore = writable<string>("");

let refreshToken = "";
const refreshTokenTimeInSeconds = 60; // 5 minutes

fetchAccessToken();

/**
 * Fetches the access token from the backend service
 */
export async function fetchAccessToken(): Promise<void> {
    // const res = await fetch(`/oauth2/auth`, {
    //     method: "GET",
    //     credentials: "include",
    // });

    // const temporaryToken = res.headers.get("Authorization");
    // const token = temporaryToken ? temporaryToken.split(" ")[1] : "";
    // console.log(token);

    // authStore.set(token);

    const response = await fetch(
        `https://login.verbis.dkfz.de/realms/test-realm-01/protocol/openid-connect/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: "bridgehead-test-private",
                client_secret: "mmDjwfaoLeTzdRUeGZRDEIaYXgY3zL6r",
            }),
            credentials: "include",
        },
    );

    if (response.ok) {
        const data = await response.json();
        console.log("fetchAccesstoken", data);
        authStore.set(data.access_token);
        refreshToken = data.refresh_token;

        authStore.subscribe((value) => {
            console.log(value);
        });
    } else {
        console.error("Failed to fetch access token");
    }
    startTokenRefreshTimer();
}

/**
 * Function to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<void> {
    const response = await fetch(
        `https://login.verbis.dkfz.de/realms/test-realm-01/protocol/openid-connect/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: "bridgehead-test-private",
                client_secret: "mmDjwfaoLeTzdRUeGZRDEIaYXgY3zL6r",
                refresh_token: refreshToken,
            }),
            credentials: "include",
        },
    );

    if (response.ok) {
        const data = await response.json();
        console.log("refreshAccesstoken", data);
        console.log(response);
        authStore.set(data.access_token);
        refreshToken = data.refresh_token;
    } else {
        console.error("Failed to refresh access token");
    }
}

/**
 * Function to start the token refresh timer
 */
function startTokenRefreshTimer(): void {
    setInterval(refreshAccessToken, refreshTokenTimeInSeconds * 1000);
}
