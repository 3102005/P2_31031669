import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import passport from './config/passport';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import indexRouter from './routes/index';
import contactRouter from './routes/contact';
import paymentRouter from './routes/payment';
import authRouter from './routes/auth';
import { addUserToViews } from './middleware/auth';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration with security improvements
app.use(session({
  secret: process.env.SESSION_SECRET || 'patitas-moviles-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'lax', // Allow OAuth redirects while maintaining security
    maxAge: 15 * 60 * 1000 // 15 minutes inactivity timeout
  }
}));

// Flash middleware
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add user info to all views
app.use(addUserToViews);

app.use('/', indexRouter);
app.use('/contact', contactRouter);
app.use('/payment', paymentRouter);
app.use('/auth', authRouter);

// Google OAuth callback route (direct endpoint)
app.get('/callback', (req, res, next) => {
  console.log('🔄 Google OAuth callback received');
  console.log('🔄 Query params:', req.query);
  next();
}, passport.authenticate('google', {
  successRedirect: '/admin',
  failureRedirect: '/auth/login',
  failureFlash: true
}), (req, res) => {
  console.log('🔄 OAuth callback completed');
  console.log('🔄 User after auth:', req.user ? (req.user as any).username : 'No user');
});

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

export default app;
