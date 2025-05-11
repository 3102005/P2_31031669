import { Router, Request, Response, NextFunction } from 'express';

const router: Router = Router();

/* GET users listing. */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('respond with a resource');
});

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
