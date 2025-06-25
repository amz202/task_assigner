import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../data/db';
import { TaskTable, UserTable } from '../data/schema';
import { eq  } from 'drizzle-orm';
import { generateToken } from '../utils/generateToken';

// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number
                role: string;

                // add other user properties if needed
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

export const createTask = async (req : Request , res : Response) =>{
   
    const {title , description , tag } = req.body;

    if (!title || !description || !tag) {
         res.status(400).json({ error: 'Title, description, and tag are required.' });
         return;
    }

    if (!Object.values(Tag).includes(tag)) {
        res.status(400).json({ error: 'Invalid tag provided.' });
        return;
    }

    if (!req.user || !req.user.id) {
        res.status(401).json({ error: 'User not authenticated.' });
        return;
    }

    const task = await db.insert(TaskTable).values({
        title,
        description,
        tag,
        status: Status.PENDING,
        createdById: req.user.id,
        assignedToId: null,
    });

    res.status(200)


}

export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
        res.status(400).json({ error: 'Task id is required in params.' });
        return;
    }

    // Validate fields if necessary (optional)
    // For example, if tag is being updated, check if it's valid
    if (updates.tag && !Object.values(Tag).includes(updates.tag)) {
        res.status(400).json({ error: 'Invalid tag provided.' });
        return;
    }
    if (updates.status && !Object.values(Status).includes(updates.status)) {
        res.status(400).json({ error: 'Invalid status provided.' });
        return;
    }

    // Todo: update the task in the database

    // For now, just return a mock response
    res.status(200).json({
        message: `Task with id ${id} would be updated with:`,
        updates
    });
};


export const deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ error: 'Task id is required in params.' });
        return;
    }   
    

    // todo : delete the task from the database
}
