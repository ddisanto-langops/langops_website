import { Router } from 'express';
import { exampleData } from '../services/exampleData.mjs';

const router = Router();

router.get("/api/data", (req, res) => {
    res.json(exampleData);
});

export default router;