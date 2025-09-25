import {Request, Response, NextFunction} from 'express';

export function setLocals(req: Request, res: Response, next: NextFunction){
    res.locals.page = '';
    next();
}