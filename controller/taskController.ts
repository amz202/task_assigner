import express, { Request, Response } from 'express';
import { db } from '../data/db';
import { TaskTable, UserTable, TaskLogTable, taskActionEnum, taskTagEnum, taskStatusEnum } from '../data/schema';
import { eq, and  , or} from 'drizzle-orm';

// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                role: string;
            }
        }
    }
}

enum Tag {
    BUG = 'bug',
    FEATURE = 'feature',
    SUPPORT = 'support'
}

enum Status {
    PENDING = 'pending',
    ASSIGNED = 'assigned',
    DECLINED = 'declined',
    COMPLETED = 'completed'
}

// Create a new task (Employee only)
export const createTask = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'employee') {
        res.status(403).json({ message: 'Only employees can create tasks' });
        return; 
    }

    const { title, description, tag } = req.body;

    if (!title || !description || !tag) {
        res.status(400).json({ error: 'Title, description, and tag are required.' });
        return; 
    }

    if (!Object.values(taskTagEnum.enumValues).includes(tag)) {
        res.status(400).json({ error: 'Invalid tag provided.' });
        return; 
    }

    try {
        // Create task
        const [task] = await db.insert(TaskTable).values({
            title,
            description,
            tag,
            status: 'pending',
            createdById: req.user.id,
        }).returning();

        // Log task creation
        await db.insert(TaskLogTable).values({
            taskId: task.id,
            action: 'created',
            performedById: req.user.id,
            message: 'Task created by employee',
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create task' });
    }
};

// Update task (Employee can update only if pending)
export const updateTask = async (req: Request, res: Response) => {
     if (!req.user || req.user.role !== 'employee') {
        res.status(403).json({ message: 'Only employees can update tasks' });
        return; 
    }

    const { id } = req.params;
    const updates = req.body;

    try {
        // Get current task
        const [task] = await db.select().from(TaskTable).where(eq(TaskTable.id, Number(id)));
        
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return; 
        }

        // Only creator can update if task is pending
        if (task.createdById !== req.user.id || task.status !== 'pending') {
            res.status(403).json({ message: 'Cannot update this task' });
            return; 
        }

        // Validate updates
        if (updates.tag && !Object.values(taskTagEnum.enumValues).includes(updates.tag)) {
            res.status(400).json({ error: 'Invalid tag provided' });
            return; 
        }

        // Update task
        const [updated] = await db.update(TaskTable)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(TaskTable.id, Number(id)))
            .returning();

        // Log update
        await db.insert(TaskLogTable).values({
            taskId: Number(id),
            action: 'created',
            performedById: req.user.id,
            message: 'Task updated by employee',
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update task' });
    }
};

// Delete task (Employee and admin can delete only if pending)
export const deleteTask = async (req: Request, res: Response) => {
     if (!req.user || (req.user.role === 'manager' )) {
        res.status(403).json({ message: 'Only employees and admin can delete tasks' });
        return; 
    }

    const { id } = req.params;

    try {
        // Get current task
        const [task] = await db.select().from(TaskTable).where(eq(TaskTable.id, Number(id)));
        
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return; 
        }

        // Only creator can delete if task is pending
        if (task.createdById !== req.user.id || task.status !== 'pending') {
            res.status(403).json({ message: 'Cannot delete this task' });
            return; 
        }

      


        // Delete task
        await db.delete(TaskTable).where(eq(TaskTable.id, Number(id)));

        

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete task' });
    }
};

// Assign task to manager (Admin only)
export const assignTask = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Only admin can assign tasks' });
        return; 
    }

    console.log("working 1");
    const { id }= req.params ;
    const   {managerId} = req.body;

    console.log(id , managerId);
    if (!managerId) {
        res.status(400).json({ message: 'Manager ID is required' });
        return; 
    }

    console.log("working 2");
    try {
        // Update task
        const [updated] = await db.update(TaskTable)
            .set({ 
                assignedToId: Number(managerId),
                status: 'assigned',
                updatedAt: new Date()
            })
            .where(eq(TaskTable.id, Number(id)))
            .returning();
            console.log("working 3");
        if (!updated) {
            res.status(404).json({ message: 'Task not found' });
            return; 
        }

        // Log assignment
        await db.insert(TaskLogTable).values({
            taskId: Number(id),
            action: 'assigned',
            performedById: req.user.id,
            message: `Task assigned to manager ${managerId}`,
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to assign task' });
    }
};

// Accept task (Manager only)
export const acceptTask = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'manager') {
        res.status(403).json({ message: 'Only managers can accept tasks' });
        return; 
    }

    const { id } =  req.params;

    try {
        // Get current task
        const [task] = await db.select().from(TaskTable).where(eq(TaskTable.id, Number(id)));
        
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return; 
        }

        // Verify task is assigned to this manager
        if (task.assignedToId !== req.user.id || task.status !== 'assigned') {
            res.status(403).json({ message: 'Cannot accept this task' });
            return; 
        }

        // Update task
        const [updated] = await db.update(TaskTable)
            .set({ 
                status: 'in_progress',
                updatedAt: new Date()
            })
            .where(eq(TaskTable.id, Number(id)))
            .returning();

        // Log acceptance
        await db.insert(TaskLogTable).values({
            taskId: Number(id),
            action: 'accepted',
            performedById: req.user.id,
            message: 'Task accepted by manager',
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to accept task' });
    }
};

// Decline task (Manager only)
export const declineTask = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'manager') {
        res.status(403).json({ message: 'Only managers can decline tasks' });
        return; 
    }

    const { id } = req.params;

    try {
        // Get current task
        const [task] = await db.select().from(TaskTable).where(eq(TaskTable.id, Number(id)));
        
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return; 
        }

        // Verify task is assigned to this manager
        if (task.assignedToId !== req.user.id || task.status !== 'assigned') {
            res.status(403).json({ message: 'Cannot decline this task' });
            return; 
        }

        // Update task
        const [updated] = await db.update(TaskTable)
            .set({ 
                status: 'declined',
                assignedToId: null,
                updatedAt: new Date()
            })
            .where(eq(TaskTable.id, Number(id)))
            .returning();

        // Log decline
        await db.insert(TaskLogTable).values({
            taskId: Number(id),
            action: 'declined',
            performedById: req.user.id,
            message: 'Task declined by manager',
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to decline task' });
    }
};

// Complete task (Manager only)
export const completeTask = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'manager') {
        res.status(403).json({ message: 'Only managers can complete tasks' });
        return;        
    }

    const { id } = req.params;

    try {
        // Get current task
        const [task] = await db.select().from(TaskTable).where(eq(TaskTable.id, Number(id)));
        
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
        return;            
        }

        // Verify task is accepted by this manager
        if (task.assignedToId !== req.user.id || task.status !== 'assigned') {
            res.status(403).json({ message: 'Cannot complete this task' });
        return;            
        }

        // Update task
        const [updated] = await db.update(TaskTable)
            .set({ 
                status: 'completed',
                updatedAt: new Date()
            })
            .where(eq(TaskTable.id, Number(id)))
            .returning();

        // Log completion
        await db.insert(TaskLogTable).values({
            taskId: Number(id),
            action: 'completed',
            performedById: req.user.id,
            message: 'Task completed by manager',
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to complete task' });
    }
};

// Get task logs
export const getTaskLogs = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const logs = await db.select().from(TaskLogTable).where(eq(TaskLogTable.taskId, Number(id)));
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch task logs' });
    }
};

// get all manager for admin dash
export const getAllManagers = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Only admin can view managers' });
        return;
    }

    try {
        const managers = await db.select().from(UserTable).where(eq(UserTable.role, 'manager'));
        res.status(200).json(managers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch managers' });
    }
};
// get manager tasks 
export const getManagerTasks = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'manager') {
        res.status(403).json({ message: 'Only managers can view their tasks' });
        return;
    }

    try {
        const tasks = await db.select().from(TaskTable).where(eq(TaskTable.assignedToId, req.user.id));
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch manager tasks' });
    }
};
// get task generated by employee
export const getEmployeeTasks = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'employee') {
        res.status(403).json({ message: 'Only employees can view their tasks' });
        return;
    }

    try {
        const tasks = await db.select().from(TaskTable).where(eq(TaskTable.createdById, req.user.id));
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employee tasks' });
    }
};
// get task for assignment condition (pending or declined)
export const getTasksForAssignment = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Only admin can view tasks for assignment' });
        return;
    }

    try {
            const tasks = await db .select().from(TaskTable);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks for assignment' });
    }
};

// all employees which are not approved right now
export const getPendingEmployees = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Only admin can view pending employees' });
        return;
    }

    try {
        const pendingEmployees = await db.select().from(UserTable).where(
            and(
                eq(UserTable.isApproved, 0),
                eq(UserTable.role, 'employee')
            )
        );
        res.status(200).json(pendingEmployees);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending employees' });
    }
}