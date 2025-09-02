/**
 * Simple test endpoint to debug Vercel deployment
 */

export default function handler(req: any, res: any) {
  res.status(200).json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    method: req.method,
    env: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
}