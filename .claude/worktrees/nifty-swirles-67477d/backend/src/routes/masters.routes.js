const express = require('express');
const router = express.Router();
const mastersController = require('../controllers/masters.controller');
const stateCityController = require('../controllers/state-city.controller');
const { authenticateToken } = require('../middleware/auth');

// ===== STATE-CITY ROUTES =====
router.get('/states', authenticateToken, stateCityController.getStates);
router.get('/states/:stateId/cities', authenticateToken, stateCityController.getCitiesByState);
router.get('/cities/search', authenticateToken, stateCityController.searchCities);
router.get('/cities', authenticateToken, stateCityController.getAllCities);
router.post('/cities', authenticateToken, stateCityController.addCity);

// ===== CONSIGNOR/CONSIGNEE ROUTES =====
router.get('/consignor-consignees/search', authenticateToken, mastersController.searchConsignorConsignees);
router.get('/consignor-consignees', authenticateToken, mastersController.getConsignorConsignees);
router.get('/consignor-consignees/:id', authenticateToken, mastersController.getConsignorConsigneeById);
router.post('/consignor-consignees', authenticateToken, mastersController.createConsignorConsignee);
router.patch('/consignor-consignees/:id', authenticateToken, mastersController.updateConsignorConsignee);
router.delete('/consignor-consignees/:id', authenticateToken, mastersController.deleteConsignorConsignee);

// ===== INVOICE PARTY ROUTES =====
router.get('/invoice-parties/search', authenticateToken, mastersController.searchInvoiceParties);
router.get('/invoice-parties', authenticateToken, mastersController.getInvoiceParties);
router.get('/invoice-parties/:id', authenticateToken, mastersController.getInvoicePartyById);
router.post('/invoice-parties', authenticateToken, mastersController.createInvoiceParty);
router.patch('/invoice-parties/:id', authenticateToken, mastersController.updateInvoiceParty);
router.delete('/invoice-parties/:id', authenticateToken, mastersController.deleteInvoiceParty);

// ===== VEHICLE OWNER/BROKER ROUTES =====
router.get('/vehicle-owners/search', authenticateToken, mastersController.searchVehicleOwnerBrokers);
router.get('/vehicle-owners', authenticateToken, mastersController.getVehicleOwnerBrokers);
router.get('/vehicle-owners/:id', authenticateToken, mastersController.getVehicleOwnerBrokerById);
router.post('/vehicle-owners', authenticateToken, mastersController.createVehicleOwnerBroker);
router.patch('/vehicle-owners/:id', authenticateToken, mastersController.updateVehicleOwnerBroker);
router.delete('/vehicle-owners/:id', authenticateToken, mastersController.deleteVehicleOwnerBroker);

// Vehicle management under owner
router.post('/vehicle-owners/:id/vehicles', authenticateToken, mastersController.addVehicleToOwner);
router.patch('/vehicle-owners/:id/vehicles/:vehicleId', authenticateToken, mastersController.updateOwnerVehicle);
router.delete('/vehicle-owners/:id/vehicles/:vehicleId', authenticateToken, mastersController.deleteOwnerVehicle);

module.exports = router;
