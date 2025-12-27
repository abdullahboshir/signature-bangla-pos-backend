import { GenericController } from "@core/controllers/GenericController.ts";
import { AutomationService } from "./automation.service.ts";

const automationServiceMap = {
    create: AutomationService.createRule,
    getAll: AutomationService.getAllRules,
    getById: AutomationService.getRuleById,
    update: AutomationService.updateRule,
    delete: AutomationService.deleteRule
};

export const automationController = new GenericController(automationServiceMap, 'AutomationRule');
