import express , {Request , Response}  from 'express';
import validateToken from '../middleware/validateToken';

const router = express.Router();

import { signup , login , logout , checkAuth } from '../controller/authController';


router.post('/signup', signup );


router.post('/login', login);

router.post('/logout', validateToken , logout);


 router.get("/checkAuth", validateToken, checkAuth );

export default router;
