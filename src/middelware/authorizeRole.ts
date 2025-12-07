import { Request, Response, NextFunction,  } from "express";

export function authorizeRole(role: string){
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user?.role.toLowerCase() !== role) {
            return res.status(403).json({message: 'Toegang geweigerd'});
        }
        next();
    };
}