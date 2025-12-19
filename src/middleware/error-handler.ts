import type { NextFunction, Request, Response } from "express";

const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.error("Global error handler caught:", err);
	res.status(500).json({ success: false, message: "Internal server error" });
};

export default errorHandler;
