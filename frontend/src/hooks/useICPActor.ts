import { useState, useEffect } from 'react';
import { createAuthenticatedActor } from '@/lib/icp/actor';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom React Hook for ICP Actor with Authentication Support
 * Automatically creates/recreates the actor when identity changes
 * This ensures all backend calls use the authenticated identity
 * 
 * @returns {object} { actor, loading, error }
 * - actor: The ICP actor instance (null until loaded)
 * - loading: Boolean indicating if the actor is being initialized
 * - error: Error message if initialization failed (null otherwise)
 */
export const useICPActor = () => {
    const { identity, isAuthenticated } = useAuth();
    const [actor, setActor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeActor = async () => {
            try {
                setLoading(true);
                setError(null);
                // Pass the authenticated identity to create the actor
                // If not authenticated, identity will be undefined (anonymous)
                const icpActor = await createAuthenticatedActor(identity);
                setActor(icpActor);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to connect to backend';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        initializeActor();
    }, [identity, isAuthenticated]); // Re-create actor when identity changes!

    return { actor, loading, error };
};

