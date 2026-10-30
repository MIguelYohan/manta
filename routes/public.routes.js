import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({status: 'API Running OK!'});
});

export default router;