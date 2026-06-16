const express = require('express');
const router = express.Router();
const ppeController = require('../controllers/ppeController');

router.get('/', ppeController.getPPEItems);
router.get('/:id', ppeController.getPPEItem);
router.get('/requests', ppeController.getRequests);
router.post('/requests', ppeController.createRequest);
router.put('/requests/:id/approve', ppeController.approve);
router.put('/requests/:id/reject', ppeController.reject);
router.put('/requests/:id/fulfill', ppeController.fulfill);

module.exports = router;