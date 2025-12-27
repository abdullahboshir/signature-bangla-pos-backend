import express from 'express';
import { automationController } from './automation.controller.ts';

const router = express.Router();

router.post('/rules', automationController.create.bind(automationController));
router.get('/rules', automationController.getAll.bind(automationController));
router.get('/rules/:id', automationController.getById.bind(automationController));
router.patch('/rules/:id', automationController.update.bind(automationController));
router.delete('/rules/:id', automationController.delete.bind(automationController));

export const automationRoutes = router;
