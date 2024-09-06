import { Request, RequestHandler, Response } from "express";
import { z } from 'zod';
import { getUser } from "../../firebase/index.js";

const getUserSchema = z.object({
    email: z.string().email(),
});

export const getUserHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const parsedBody = getUserSchema.parse(req.body);
        const { email } = parsedBody
        const user = await getUser(email)
        res.status(200).json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Error listing classes class' });
        }
    }
};