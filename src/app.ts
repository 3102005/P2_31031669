import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import passport from './config/passport';
import dotenv from 'dotenv';
import i18next from './services/I18nService';
import middleware from 'i18next-http-middleware';

// Load environment variables
dotenv.config();

import indexRouter from './routes/index';
import contactRouter from './routes/contact';
import paymentRouter from './routes/payment';
import authRouter from './routes/auth';
import languageRouter from './routes/language';
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

// Session configuration - simplified for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'patitas-moviles-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash middleware
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// i18n middleware
app.use(middleware.handle(i18next));

// Add user info to all views
app.use(addUserToViews);

// Add i18n and localization to all views
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.t = req.t;
  res.locals.i18n = i18next;
  res.locals.currentLanguage = req.language || 'es';
  next();
});

app.use('/', indexRouter);
app.use('/contact', contactRouter);
app.use('/payment', paymentRouter);
app.use('/auth', authRouter);
app.use('/language', languageRouter);

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
