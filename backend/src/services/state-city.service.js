const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all states
 */
const getStates = async () => {
  const states = await prisma.state.findMany({
    where: { isActive: true },
    orderBy: { stateName: 'asc' },
    include: {
      _count: {
        select: { cities: true }
      }
    }
  });

  return states;
};

/**
 * Get cities by state
 */
const getCitiesByState = async (stateId) => {
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

  return cities;
};

/**
 * Get all cities with state info
 */
const getAllCities = async () => {
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
