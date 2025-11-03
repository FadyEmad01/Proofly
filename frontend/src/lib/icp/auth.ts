import { AuthClient } from '@dfinity/auth-client';

let authClientPromise: Promise<AuthClient> | null = null;

export const getAuthClient = async (): Promise<AuthClient> => {
	if (!authClientPromise) authClientPromise = AuthClient.create();
	return authClientPromise;
};

// MindVault v2-style: always use II v2 endpoint
export const getIdentityProviderUrl = (): string => 'https://id.ai/';

// Optional derivation origin (use your deployed asset canister origin when available)
const getDerivationOrigin = (): string | undefined => {
    const env = process.env.NEXT_PUBLIC_DERIVATION_ORIGIN;
    return env && env.length > 0 ? env : undefined;
};

export const login = async () => {
	const client = await getAuthClient();
    await new Promise<void>((resolve) => {
        client.login({
            identityProvider: getIdentityProviderUrl(),
            derivationOrigin: getDerivationOrigin(),
            onSuccess: () => resolve(),
        });
    });
    const identity = client.getIdentity();
    persistPrincipal(identity);
    return identity;
};

export const logout = async () => {
	const client = await getAuthClient();
	await client.logout();
    clearStoredPrincipal();
    return client.getIdentity();
};

export const getIdentity = async () => {
	const client = await getAuthClient();
	return client.getIdentity();
};

export const isAuthenticated = async () => {
    const client = await getAuthClient();
    return client.isAuthenticated();
};

// Local principal persistence
export const PRINCIPAL_STORAGE_KEY = 'proofly_principal_id';

export const getStoredPrincipal = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(PRINCIPAL_STORAGE_KEY);
    } catch {
        return null;
    }
};

export const persistPrincipal = (identity: any) => {
    if (typeof window === 'undefined' || !identity) return;
    try {
        const principal = identity.getPrincipal?.().toText?.();
        if (principal) localStorage.setItem(PRINCIPAL_STORAGE_KEY, principal);
    } catch {
        // ignore storage errors
    }
};

export const clearStoredPrincipal = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(PRINCIPAL_STORAGE_KEY);
    } catch {
        // ignore
    }
};
