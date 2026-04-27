import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from './contexts/auth';
import { AuthStack } from './navigation/auth-stack';
import { UserStack } from './navigation/user-stack';
import { AdminStack } from './navigation/admin-stack';

export default function App() {
  const [authState, dispatch] = React.useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.payload.userToken,
            adminToken: action.payload.adminToken,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload.userToken,
            isLoading: false,
          };
        case 'SIGN_IN_ADMIN':
          return {
            ...prevState,
            isSignout: false,
            adminToken: action.payload.adminToken,
            isLoading: false,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            adminToken: null,
            isLoading: false,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      adminToken: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const [userToken, adminToken] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('adminToken'),
        ]);

        dispatch({
          type: 'RESTORE_TOKEN',
          payload: { userToken, adminToken },
        });
      } catch (e) {
        console.error('Failed to restore token:', e);
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: { userToken: null, adminToken: null },
        });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (email: string, password: string) => {
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            }
          );

          if (!response.ok) throw new Error('Login failed');

          const data = await response.json();
          const { token } = data;

          await AsyncStorage.setItem('userToken', token);
          dispatch({ type: 'SIGN_IN', payload: { userToken: token } });
        } catch (e) {
          console.error('Sign in error:', e);
          throw e;
        }
      },

      signInAdmin: async (adminId: string, password: string) => {
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adminId, password }),
            }
          );

          if (!response.ok) throw new Error('Admin login failed');

          const data = await response.json();
          const { token } = data;

          await AsyncStorage.setItem('adminToken', token);
          dispatch({ type: 'SIGN_IN_ADMIN', payload: { adminToken: token } });
        } catch (e) {
          console.error('Admin sign in error:', e);
          throw e;
        }
      },

      signUp: async (name: string, email: string, password: string) => {
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/register`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password, confirmPassword: password }),
            }
          );

          if (!response.ok) throw new Error('Sign up failed');

          const data = await response.json();
          const { token } = data;

          await AsyncStorage.setItem('userToken', token);
          dispatch({ type: 'SIGN_IN', payload: { userToken: token } });
        } catch (e) {
          console.error('Sign up error:', e);
          throw e;
        }
      },

      signOut: async () => {
        try {
          await Promise.all([
            AsyncStorage.removeItem('userToken'),
            AsyncStorage.removeItem('adminToken'),
          ]);
          dispatch({ type: 'SIGN_OUT' });
        } catch (e) {
          console.error('Sign out error:', e);
        }
      },

      refreshToken: async () => {
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          if (!userToken) return null;

          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          if (!response.ok) {
            dispatch({ type: 'SIGN_OUT' });
            return null;
          }

          const data = await response.json();
          await AsyncStorage.setItem('userToken', data.token);
          return data.token;
        } catch (e) {
          console.error('Token refresh error:', e);
          dispatch({ type: 'SIGN_OUT' });
          return null;
        }
      },
    }),
    []
  );

  if (authState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        {authState.userToken ? (
          <UserStack />
        ) : authState.adminToken ? (
          <AdminStack />
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
