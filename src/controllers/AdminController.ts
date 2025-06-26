import { Request, Response } from 'express';
import ContactModel from '../models/ContactModel';
import PaymentModel from '../models/PaymentModel';

class AdminController {
  private contactModel: ContactModel;
  private paymentModel: PaymentModel;

  constructor() {
    this.contactModel = new ContactModel();
    this.paymentModel = new PaymentModel();
  }

  public async renderAdminView(req: Request, res: Response): Promise<void> {
    try {
      // Obtener estadísticas reales
      const contacts = await this.contactModel.getAllContacts();
      const payments = await this.paymentModel.getAll();
      
      // Calcular estadísticas
      const totalContacts = contacts.length;
      const totalPayments = payments.length;
      
      // Calcular ingresos del mes actual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyPayments = payments.filter(payment => {
        if (!payment.createdAt) return false;
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               payment.status === 'COMPLETED';
      });
      
      const monthlyRevenue = monthlyPayments.reduce((total, payment) => {
        return total + (payment.amount || 0);
      }, 0);
      
      // Calcular tasa de satisfacción (simulada basada en contactos vs pagos)
      const satisfactionRate = totalContacts > 0 ? 
        Math.min(Math.round((totalPayments / totalContacts) * 100), 100) : 0;
      
      // Obtener contactos recientes (últimos 5)
      const recentContacts = contacts.slice(0, 5);
      
      // Obtener pagos recientes (últimos 5)
      const recentPayments = payments.slice(0, 5);

      res.render('admin', {
        title: 'Panel de Administración',
        googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
        user: req.user,
        stats: {
          totalContacts,
          totalPayments,
          monthlyRevenue: monthlyRevenue.toFixed(2),
          satisfactionRate
        },
        recentContacts,
        recentPayments
      });
    } catch (error) {
      console.error('Error rendering admin view:', error);
      res.status(500).render('error', {
        message: 'Error al cargar el panel de administración',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }
}

export default AdminController;
