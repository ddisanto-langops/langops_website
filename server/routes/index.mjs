/*
Maps the url path to the functions in controllers/viewControllers
which determine views and fill in data
*/
import { Router } from 'express';
import * as viewController from '../controllers/viewController.mjs';
import { exampleData } from '../services/exampleData.mjs';

const router = Router();

router.get("/api/data", (req, res) => {
    res.json(exampleData);
});

router.get('/', viewController.viewHome);
router.get('/dashboard', viewController.viewDashboard);

export default router;