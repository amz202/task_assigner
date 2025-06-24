import { Request, Response, NextFunction } from 'express';

const error = (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    res.status(err.status || 500).json({ error: err.message });
};

export default error;
