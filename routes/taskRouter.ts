import express from 'express';
import validateToken from '../middleware/validateToken';
import { 
    createTask, 
    updateTask, 
    deleteTask, 
    assignTask,
    acceptTask,
    declineTask,
    completeTask,
    getTaskLogs
} from '../controller/taskController';

const router = express.Router();

// Task CRUD operations
router.post('/create', validateToken, createTask);
router.put('/update/:id', validateToken, updateTask);
router.delete('/delete/:id', validateToken, deleteTask);

// Task workflow operations
router.post('/assign/:id', validateToken, assignTask);
router.post('/accept/:id', validateToken, acceptTask);
router.post('/decline/:id', validateToken, declineTask);
router.post('/complete/:id', validateToken, completeTask);

// Task logs
router.get('/logs/:id', validateToken, getTaskLogs);

export default router;
