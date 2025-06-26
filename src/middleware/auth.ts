import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔐 Auth check for:', req.originalUrl);
  console.log('🔐 Is authenticated:', req.isAuthenticated());
  console.log('🔐 User:', req.user ? (req.user as any).username : 'No user');
  
  if (req.isAuthenticated()) {
    console.log('✅ User authenticated, proceeding');
    return next();
  }
  
  console.log('❌ User not authenticated, redirecting to login');
  // Store the original URL to redirect after login
  if (req.session) {
    (req.session as any).returnTo = req.originalUrl;
  }
  
  res.redirect('/auth/login');
};

// Middleware to check if user is admin (for user registration)
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    // For now, we'll consider the first user (admin) as admin
    // In a real app, you might have a role field
    if (user && (user.username === 'admin' || user.id === 1)) {
      return next();
    }
  }
  
  res.status(403).render('error', {
    message: 'Acceso denegado',
    error: { status: 403, stack: '' },
    title: 'Error 403'
  });
};

// Middleware to redirect authenticated users away from login/register pages
export const redirectIfAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }
  next();
};

// Middleware to add user info to all views
export const addUserToViews = (req: Request, res: Response, next: NextFunction) => {
  res.locals.user = req.user as any || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
};
