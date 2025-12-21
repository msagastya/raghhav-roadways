import { create } from 'zustand';

// Helper functions for localStorage
const setAgentTokens = (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('agentAccessToken', accessToken);
        localStorage.setItem('agentRefreshToken', refreshToken);
    }
};

const clearAgentTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('agentAccessToken');
        localStorage.removeItem('agentRefreshToken');
        localStorage.removeItem('agentUser');
    }
};

const saveAgentUser = (user) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('agentUser', JSON.stringify(user));
    }
};

const getSavedAgentUser = () => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('agentUser');
        return user ? JSON.parse(user) : null;
    }
    return null;
};

const getAgentAccessToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('agentAccessToken');
    }
    return null;
};

const useAgentAuthStore = create((set) => ({
    agent: null,
    isAuthenticated: false,
    isLoading: true,

    setAgent: (agent) => {
        saveAgentUser(agent);
        set({ agent, isAuthenticated: true, isLoading: false });
    },

    setTokens: (accessToken, refreshToken) => {
        setAgentTokens(accessToken, refreshToken);
    },

    logout: () => {
        clearAgentTokens();
        set({ agent: null, isAuthenticated: false });
    },

    initialize: () => {
        const token = getAgentAccessToken();
        const savedAgent = getSavedAgentUser();

        if (token && savedAgent) {
            set({ agent: savedAgent, isAuthenticated: true, isLoading: false });
        } else {
            set({ isLoading: false });
        }
    },
}));

export default useAgentAuthStore;
