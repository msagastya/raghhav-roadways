const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const cache = require('../utils/cache');

/**
 * Get all states
 */
const getStates = async () => {
  const cacheKey = 'state-city_states';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const states = await prisma.state.findMany({
    where: { isActive: true },
    orderBy: { stateName: 'asc' },
    include: {
      _count: {
        select: { cities: true }
      }
    }
  });

  cache.set(cacheKey, states, 60 * 60 * 1000); // 1 hour TTL
  return states;
};

/**
 * Get cities by state
 */
const getCitiesByState = async (stateId) => {
  const cacheKey = `state-city_state_${stateId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const cities = await prisma.city.findMany({
    where: {
      stateId: parseInt(stateId),
      isActive: true
    },
    orderBy: { cityName: 'asc' },
    include: {
      state: {
        select: {
          stateName: true
        }
      }
    }
  });

  cache.set(cacheKey, cities, 15 * 60 * 1000); // 15 mins TTL
  return cities;
};

/**
 * Get all cities with state info
 */
const getAllCities = async () => {
  const cacheKey = 'state-city_all_cities';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { cityName: 'asc' },
    include: {
      state: {
        select: {
          stateName: true,
          stateCode: true
        }
      }
    }
  });

  cache.set(cacheKey, cities, 30 * 60 * 1000); // 30 mins TTL
  return cities;
};

/**
 * Add new city
 */
const addCity = async (data) => {
  const { cityName, stateId } = data;

  // Check if city already exists for this state
  const existingCity = await prisma.city.findFirst({
    where: {
      cityName,
      stateId: parseInt(stateId)
    }
  });

  if (existingCity) {
    throw new ApiError(400, 'City already exists in this state');
  }

  const city = await prisma.city.create({
    data: {
      cityName,
      stateId: parseInt(stateId)
    },
    include: {
      state: {
        select: {
          stateName: true
        }
      }
    }
  });

  // Invalidate state-city cache
  cache.invalidatePrefix('state-city_');

  return city;
};

/**
 * Search cities
 */
const searchCities = async (query, stateId) => {
  const where = {
    isActive: true,
    cityName: {
      contains: query,
      mode: 'insensitive'
    }
  };

  if (stateId) {
    where.stateId = parseInt(stateId);
  }

  const cities = await prisma.city.findMany({
    where,
    orderBy: { cityName: 'asc' },
    take: 20,
    include: {
      state: {
        select: {
          stateName: true
        }
      }
    }
  });

  return cities;
};

module.exports = {
  getStates,
  getCitiesByState,
  getAllCities,
  addCity,
  searchCities
};
