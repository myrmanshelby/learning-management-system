import { RequestHandler } from "express";

export const test: RequestHandler = (req, res) => {
    const { input } = req.body;
    console.log(`Received input: ${input}`);
    res.send({ success: true, receivedInput: input });
}

