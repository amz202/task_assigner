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
    getTaskLogs,
    getAllManagers,
    getManagerTasks,
    getEmployeeTasks,
    getTasksForAssignment,
    getPendingEmployees
} from '../controller/taskController';

const router = express.Router();

// Task CRUD operations
router.post('/create', validateToken, createTask);
router.put('/update/:id', validateToken, updateTask);
router.delete('/delete/:id', validateToken, deleteTask);

// Task workflow operations admin only
router.post('/assign/:id', validateToken, assignTask);
router.get('/all-employees', validateToken, getPendingEmployees);

// manager only operations
router.post('/accept/:id', validateToken, acceptTask);
router.post('/decline/:id', validateToken, declineTask);
router.post('/complete/:id', validateToken, completeTask);

// Task logs
router.get('/logs/:id', validateToken, getTaskLogs);

//new adds apis
router.get('/all-managers' , validateToken , getAllManagers);
router.get('/manager-tasks' , validateToken , getManagerTasks);
router.get('/employee-tasks' , validateToken , getEmployeeTasks);
router.get('/admin-tasks' , validateToken , getTasksForAssignment);


export default router;
