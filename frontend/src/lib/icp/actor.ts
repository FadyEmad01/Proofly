import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { idlFactory } from '@/declarations/backend';
import { getNetworkConfig, CANISTER_ID } from './config';

/**
 * Create ICP Actor for backend communication with optional authenticated identity
 * @param identity - Optional authenticated identity from AuthClient
 * @returns Actor instance
 * @throws Error if canister ID is not configured or connection fails
 */
export const createAuthenticatedActor = async (identity?: Identity) => {
    try {
        const { network, host, isDevelopment } = getNetworkConfig();
        
        if (!CANISTER_ID) {
            throw new Error('Backend canister ID not configured.');
        }
        
        // Create agent with identity if provided, otherwise anonymous
        const agent = new HttpAgent({ 
            host,
            identity // Pass authenticated identity here!
        });

        // In development/local, fetch the root key
        if (network === 'local' || isDevelopment) {
            await agent.fetchRootKey().catch(err => {
                throw new Error('Failed to fetch root key. Is dfx running?');
            });
        }

        const actor = Actor.createActor(idlFactory, {
            agent,
            canisterId: CANISTER_ID,
        });

        return actor;
    } catch (error) {
        throw error instanceof Error ? error : new Error(String(error));
    }
};

/**
 * @deprecated Use createAuthenticatedActor instead
 * Legacy function for backward compatibility
 */
export const createICPActor = async () => {
    return createAuthenticatedActor();
};