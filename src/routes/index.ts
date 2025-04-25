import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.render('index', {
    title: 'Hola mundo',
    Nombres: 'Estefani Jeanniels',
    Apellidos: 'Gonzalez Gonzalez',
    CI: '32.057.736',
    Seccion: '4'
  });
});

export default router;
