import express, { Request ,Response } from 'express';
import validateToken from '../middleware/validateToken';
import { createTask, deleteTask, updateTask } from '../controller/taskController';

const router = express.Router();



router.post('/create' , validateToken , createTask  )

router.put('/update/:id' , validateToken , updateTask)

router.delete('/delete/:id' , validateToken  , deleteTask)






export default router;
