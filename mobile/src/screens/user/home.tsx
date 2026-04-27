import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../contexts/auth';

const { width } = Dimensions.get('window');

interface UserData {
  name: string;
  totalRides: number;
  averageRating: number;
  credits: number;
}

interface RecentRide {
  id: string;
  destination: string;
  fare: number;
  date: string;
  status: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentRides, setRecentRides] = useState<RecentRide[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    requestLocationPermission();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from API
      setUserData({
        name: 'John Doe',
        totalRides: 12,
        averageRating: 4.8,
        credits: 500,
      });
      setRecentRides([
        {
          id: '1',
          destination: 'Airport',
          fare: 450,
          date: '2 hours ago',
          status: 'completed',
        },
        {
          id: '2',
          destination: 'Downtown Mall',
          fare: 250,
          date: '1 day ago',
          status: 'completed',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.name}! 👋</Text>
          <Text style={styles.subtitle}>Ready for your next ride?</Text>
        </View>
        <View style={styles.avatarPlaceholder}>
          <MaterialCommunityIcons name="account-circle" size={50} color="#3b82f6" />
        </View>
      </View>

      {/* Book Ride Card */}
      <TouchableOpacity
        style={styles.bookRideCard}
        onPress={() => navigation.navigate('BookRide')}
      >
        <View style={styles.bookRideContent}>
          <View>
            <Text style={styles.bookRideTitle}>Book a Ride Now</Text>
            <Text style={styles.bookRideSubtitle}>Quick and affordable rides</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
        </View>
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="car" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{userData?.totalRides}</Text>
          <Text style={styles.statLabel}>Rides</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="star" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{userData?.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="wallet" size={24} color="#10b981" />
          <Text style={styles.statValue}>₹{userData?.credits}</Text>
          <Text style={styles.statLabel}>Credits</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('BookRide')}
          >
            <MaterialCommunityIcons name="plus-circle" size={32} color="#3b82f6" />
            <Text style={styles.actionLabel}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Wallet')}
          >
            <MaterialCommunityIcons name="plus-box" size={32} color="#10b981" />
            <Text style={styles.actionLabel}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="phone" size={32} color="#f59e0b" />
            <Text style={styles.actionLabel}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialCommunityIcons name="account-outline" size={32} color="#ef4444" />
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Rides */}
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Rides')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentRides.map((ride) => (
          <View key={ride.id} style={styles.rideCard}>
            <View style={styles.rideIcon}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#3b82f6" />
            </View>
            <View style={styles.rideInfo}>
              <Text style={styles.rideDestination}>{ride.destination}</Text>
              <Text style={styles.rideDate}>{ride.date}</Text>
            </View>
            <View style={styles.rideRight}>
              <Text style={styles.rideFare}>₹{ride.fare}</Text>
              <View style={[styles.statusBadge, ride.status === 'completed' && styles.statusCompleted]}>
                <Text style={styles.statusText}>{ride.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookRideCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  bookRideContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookRideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  bookRideSubtitle: {
    fontSize: 13,
    color: '#e0e7ff',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  recentContainer: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  rideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  rideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rideInfo: {
    flex: 1,
  },
  rideDestination: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  rideDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  rideRight: {
    alignItems: 'flex-end',
  },
  rideFare: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
});
