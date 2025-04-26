import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.render('index', {
    title: 'Hola mundo',
    Nombres: 'Cristhian Alfonzo Angyalbert',
    Apellidos: 'Padron Alvarez',
    CI: '31.031.669',
    Seccion: '4'
  });
});

export default router;