const express = require('express');
const { createPlanManually, voteOnPoll, getGroupPlan, updatePlan, deletePlan } = require('../controller/PlanController');

const router = express.Router();

// Create plan manually from form
router.post('/groups/:groupId/plan', createPlanManually);

// Vote on plan poll
router.post('/plans/:planId/vote', voteOnPoll);

// Get current plan for group
router.get('/groups/:groupId/plan', getGroupPlan);

// Update existing plan
router.put('/plan/:planId', updatePlan);

// Delete existing plan
router.delete('/plan/:planId', deletePlan);

module.exports = router;