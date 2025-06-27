import express , {Request , Response}  from 'express';
import validateToken from '../middleware/validateToken';
import { signup , login , logout , checkAuth, approveUser, listPendingUsers , rejectUser} from '../controller/authController';


const router = express.Router();



router.post('/signup', signup );


router.post('/login', login);

router.post('/logout', validateToken , logout);


router.get("/checkAuth", validateToken, checkAuth );



router.get('/pending-users', validateToken, listPendingUsers);

router.post('/approve/:id', validateToken, approveUser);

router.post('/reject/:id' , validateToken ,rejectUser)

export default router;
