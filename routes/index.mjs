// Controls routes to page views
import { Router } from 'express';
import * as viewController from '../controllers/viewController.mjs';

const router = Router();

router.get('/', viewController.viewHome);
router.get('/dashboard', viewController.viewDashboard);

export default router;