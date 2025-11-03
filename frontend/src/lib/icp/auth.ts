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
	return client.getIdentity();
};

export const logout = async () => {
	const client = await getAuthClient();
	await client.logout();
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
