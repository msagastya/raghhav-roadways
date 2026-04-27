import React from 'react';

export const AuthContext = React.createContext({
  signIn: async (email: string, password: string) => {},
  signInAdmin: async (adminId: string, password: string) => {},
  signUp: async (name: string, email: string, password: string) => {},
  signOut: async () => {},
  refreshToken: async () => null as string | null,
});
