import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vendorRoutes from './vendor.routes';
import caregiverRoutes from './caregiver.routes';
import serviceRoutes from './service.routes';
import bookingRoutes from './booking.routes';
import reviewRoutes from './review.routes';
import familyContactRoutes from './family-contact.routes';
import uploadRoutes from './upload.routes';
import adminRoutes from './admin.routes';
import { requireAuth } from '../middleware/require-auth';

export const apiRouter = Router();

// Uploads sit behind auth (multer runs after the cookie check)
uploadRoutes.use(requireAuth);

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/vendors', vendorRoutes);
apiRouter.use('/caregivers', caregiverRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/family-contacts', familyContactRoutes);
apiRouter.use('/uploads', uploadRoutes);
apiRouter.use('/admin', adminRoutes);