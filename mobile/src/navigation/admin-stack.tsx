import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AdminDashboardScreen from '../screens/admin/dashboard';
import AdminRidesScreen from '../screens/admin/rides';
import AdminUsersScreen from '../screens/admin/users';
import AdminSettingsScreen from '../screens/admin/settings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ headerTitle: 'Admin Dashboard' }}
      />
    </Stack.Navigator>
  );
}

function RidesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="RidesAdmin"
        component={AdminRidesScreen}
        options={{ headerTitle: 'Manage Rides' }}
      />
    </Stack.Navigator>
  );
}

function UsersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="UsersAdmin"
        component={AdminUsersScreen}
        options={{ headerTitle: 'Manage Users' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="SettingsAdmin"
        component={AdminSettingsScreen}
        options={{ headerTitle: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export function AdminStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'RidesTab') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'UsersTab') {
            iconName = focused ? 'account-multiple' : 'account-multiple-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="RidesTab"
        component={RidesStack}
        options={{ title: 'Rides' }}
      />
      <Tab.Screen
        name="UsersTab"
        component={UsersStack}
        options={{ title: 'Users' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}
