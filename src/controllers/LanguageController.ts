import { Request, Response } from 'express';

export class LanguageController {
  static changeLanguage(req: Request, res: Response): void {
    const { lang } = req.params;
    const validLanguages = ['es', 'en'];
    
    if (!validLanguages.includes(lang)) {
      res.status(400).json({ error: 'Invalid language' });
      return;
    }
    
    // Set language cookie
    res.cookie('i18next', lang, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false,
      sameSite: 'lax'
    });
    
    // Get the referer URL to redirect back
    const referer = req.get('Referer') || '/';
    
    res.redirect(referer);
  }
}
