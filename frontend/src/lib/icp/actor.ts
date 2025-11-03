import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '@/declarations/backend';
import { getNetworkConfig, CANISTER_ID } from './config';
import type { Identity } from '@dfinity/agent';

/**
 * Create ICP Actor for backend communication
 * @returns Actor instance
 * @throws Error if canister ID is not configured or connection fails
 */
export const createICPActor = async () => {
    try {
        const { network, host, isDevelopment } = getNetworkConfig();
        
        if (!CANISTER_ID) {
            throw new Error('Backend canister ID not configured.');
        }
        
        const agent = new HttpAgent({ host });

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

export const createAuthenticatedICPActor = async (identity: Identity) => {
    const { network, host, isDevelopment } = getNetworkConfig();
    if (!CANISTER_ID) {
        throw new Error('Backend canister ID not configured.');
    }
    const agent = new HttpAgent({ host, identity });
    if (network === 'local' || isDevelopment) {
        await agent.fetchRootKey();
    }
    return Actor.createActor(idlFactory, { agent, canisterId: CANISTER_ID });
};

