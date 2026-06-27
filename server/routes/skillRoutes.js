import express from 'express';
import { createSkill, getAllSkills, getSkillById, updateSkill, deleteSkill, getSkillCategories } from '../controllers/skillController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllSkills);
router.get('/categories', getSkillCategories);
router.get('/:id', getSkillById);
router.post('/', authenticateToken, requireRole('admin'), createSkill);
router.put('/:id', authenticateToken, requireRole('admin'), updateSkill);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteSkill);

export default router;