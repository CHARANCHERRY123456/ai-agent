import { Request , Response , NextFunction } from "express";

export const errorHandler  = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Error] ${new Date().toISOString()} - ${req.method} ${req.path}:`, err.message);
    
    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (err.message.includes('GOOGLE_API_KEY')) {
        res.status(503).json({ 
            error: 'Service temporarily unavailable',
            message: 'The AI service is currently being configured. Please try again later.'
        });
    } else if (err.message.includes('rate limit')) {
        res.status(429).json({ 
            error: 'Too many requests',
            message: 'Please wait a moment before making another request.'
        });
    } else {
        res.status(500).json({ 
            error: 'Internal server error',
            message: isDevelopment ? err.message : 'Something went wrong. Please try again.'
        });
    }
} 