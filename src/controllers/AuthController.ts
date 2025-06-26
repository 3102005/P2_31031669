import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import UserModel, { CreateUserData } from '../models/UserModel';
import { body, validationResult } from 'express-validator';

class AuthController {
  private userModel: UserModel;

  constructor() {
    this.userModel = UserModel.getInstance();
  }

  // Render login page
  public renderLogin = (req: Request, res: Response) => {
    const error = req.flash ? req.flash('error')[0] : null;
    res.render('auth/login', {
      title: 'Iniciar Sesión - Patitas Móviles',
      error,
      user: req.user || null
    });
  };

  // Render register page (admin only)
  public renderRegister = (req: Request, res: Response) => {
    const error = req.flash ? req.flash('error')[0] : null;
    const success = req.flash ? req.flash('success')[0] : null;
    res.render('auth/register', {
      title: 'Registrar Usuario - Patitas Móviles',
      error,
      success,
      user: req.user || null
    });
  };

  // Handle local login
  public login = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        if (req.flash) {
          req.flash('error', info.message || 'Error de autenticación');
        }
        return res.redirect('/auth/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/admin');
      });
    })(req, res, next);
  };

  // Handle logout
  public logout = (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');
    });
  };

  // Handle user registration (admin only)
  public register = async (req: Request, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.flash) {
          req.flash('error', errors.array()[0].msg);
        }
        return res.redirect('/auth/register');
      }

      const { username, password, email } = req.body;

      // Check if user already exists
      const existingUser = await this.userModel.findByUsername(username);
      if (existingUser) {
        if (req.flash) {
          req.flash('error', 'El usuario ya existe');
        }
        return res.redirect('/auth/register');
      }

      // Create new user
      const userData: CreateUserData = {
        username,
        password,
        email
      };

      await this.userModel.createUser(userData);
      
      if (req.flash) {
        req.flash('success', 'Usuario creado exitosamente');
      }
      res.redirect('/auth/register');
    } catch (error) {
      console.error('Registration error:', error);
      if (req.flash) {
        req.flash('error', 'Error al crear el usuario');
      }
      res.redirect('/auth/register');
    }
  };

  // Google OAuth routes
  public googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
  });

  public googleCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', (err: any, user: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/auth/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/admin');
      });
    })(req, res, next);
  };

  // Validation rules
  public validateRegister = [
    body('username')
      .isLength({ min: 3 })
      .withMessage('El nombre de usuario debe tener al menos 3 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Debe ser un email válido')
  ];

  public validateLogin = [
    body('username')
      .notEmpty()
      .withMessage('El nombre de usuario es requerido'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ];
}

export default AuthController;
