import { Router } from 'express';
import { uploadedUrl, uploadAvatar, uploadLogo } from '../middleware/upload';

const router = Router();

router.post('/avatar', uploadAvatar.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: { message: 'No file uploaded', code: 'NO_FILE' } });
    return;
  }
  res.status(201).json({ url: uploadedUrl('avatar', file.filename) });
});

router.post('/logo', uploadLogo.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: { message: 'No file uploaded', code: 'NO_FILE' } });
    return;
  }
  res.status(201).json({ url: uploadedUrl('logo', file.filename) });
});

export default router;