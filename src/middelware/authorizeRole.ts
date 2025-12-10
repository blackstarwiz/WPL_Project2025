import { Request, Response, NextFunction,  } from "express";

export function authorizeRole(role: string){
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user?.role.toLowerCase() !== role) {
            req.session.message = {
                type: "error",
                text: "Toegang geweigerd - admin only",
            };
            return res.redirect("/login");
        }
        next();
    };
}