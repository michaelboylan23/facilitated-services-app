import {
  PublicClientApplication,
  type Configuration,
  type AccountInfo,
  type AuthenticationResult,
} from "@azure/msal-browser";

// MSAL configuration — App Registration ID will need to be set
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "YOUR_CLIENT_ID",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "YOUR_TENANT_ID"}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

// Scopes needed for SharePoint access
const loginScopes = {
  scopes: [
    "User.Read",
    `${import.meta.env.VITE_SHAREPOINT_URL || "https://mbpce.sharepoint.com"}/.default`,
  ],
};

export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeMsal(): Promise<void> {
  await msalInstance.initialize();
  // Handle redirect response
  await msalInstance.handleRedirectPromise();
}

export function getActiveAccount(): AccountInfo | null {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export async function loginWithMicrosoft(): Promise<AuthenticationResult> {
  return msalInstance.loginPopup(loginScopes);
}

export async function logoutMicrosoft(): Promise<void> {
  await msalInstance.logoutPopup();
}

export async function getAccessToken(): Promise<string> {
  const account = getActiveAccount();
  if (!account) {
    throw new Error("No active account. Please sign in.");
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginScopes,
      account,
    });
    return response.accessToken;
  } catch {
    // If silent fails, fall back to popup
    const response = await msalInstance.acquireTokenPopup(loginScopes);
    return response.accessToken;
  }
}
