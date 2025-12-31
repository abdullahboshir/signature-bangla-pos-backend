import express from 'express';
import { AttributeGroupController } from './attribute-group.controller.js';

const router = express.Router();

router.post(
    '/',
    AttributeGroupController.createAttributeGroup
);

router.get(
    '/',
    AttributeGroupController.getAllAttributeGroups
);

router.get(
    '/:id',
    AttributeGroupController.getAttributeGroupById
);

router.patch(
    '/:id',
    AttributeGroupController.updateAttributeGroup
);

router.delete(
    '/:id',
    AttributeGroupController.deleteAttributeGroup
);

export const AttributeGroupRoutes = router;
