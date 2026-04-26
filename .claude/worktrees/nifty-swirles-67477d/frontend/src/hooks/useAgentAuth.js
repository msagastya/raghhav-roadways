import { useEffect } from 'react';
import useAgentAuthStore from '../store/agentAuthStore';

export default function useAgentAuth() {
    const { agent, isAuthenticated, isLoading, setAgent, setTokens, logout, initialize } = useAgentAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return {
        agent,
        isAuthenticated,
        isLoading,
        setAgent,
        setTokens,
        logout,
    };
}
