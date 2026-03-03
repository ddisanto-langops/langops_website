/*
Maps the url path to the functions in controllers/viewControllers
which determine views and fill in data
*/
import { Router } from 'express';
import { exampleData } from '../services/exampleData.mjs';

const router = Router();

router.get("/api/data", (req, res) => {
    res.json(exampleData);
});

export default router;