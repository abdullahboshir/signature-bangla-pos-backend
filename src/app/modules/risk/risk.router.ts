import express from "express";
import { blacklistController, riskRuleController, RiskSearchController } from "./risk.controller.ts";

const router = express.Router();

// Fraud Check
router.post('/check', RiskSearchController.checkFraud);

// Blacklist Routes
router.post('/blacklist', blacklistController.create.bind(blacklistController));
router.get('/blacklist', blacklistController.getAll.bind(blacklistController));
router.get('/blacklist/:id', blacklistController.getById.bind(blacklistController));
router.patch('/blacklist/:id', blacklistController.update.bind(blacklistController));
router.delete('/blacklist/:id', blacklistController.delete.bind(blacklistController));

// Risk Rule Routes
router.post('/rules', riskRuleController.create.bind(riskRuleController));
router.get('/rules', riskRuleController.getAll.bind(riskRuleController));
router.get('/rules/:id', riskRuleController.getById.bind(riskRuleController));
router.patch('/rules/:id', riskRuleController.update.bind(riskRuleController));
router.delete('/rules/:id', riskRuleController.delete.bind(riskRuleController));

export const riskRoutes = router;
