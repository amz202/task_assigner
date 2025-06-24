import { Request, Response, NextFunction } from 'express';

const catchAllError = (req: Request, res: Response, next: NextFunction): void => {
    const error = new Error('Not Found') as any;
    error.status = 404;
    next(error);
};

export default catchAllError;
