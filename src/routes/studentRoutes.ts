import express from 'express';
import { registerStudent, signinStudent } from '../controllers/studentController';
import { uploadProfilePhoto } from '../middleware/upload';

const router = express.Router();

/**
 * @swagger
 * /api/students/signup:
 *   post:
 *     summary: Register a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dob
 *               - email
 *               - country
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Student's full name
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Student's email address
 *               country:
 *                 type: string
 *                 description: Student's country of residence
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Student's password
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Student's profile photo
 *     responses:
 *       201:
 *         description: Student successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 student:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Server error
 */
router.post('/signup', uploadProfilePhoto.single('profilePhoto'), async (req, res, next) => {
  try {
    await registerStudent(req, res);
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/students/signin:
 *   post:
 *     summary: Sign in a student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Student's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Student's password
 *     responses:
 *       200:
 *         description: Student successfully signed in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 student:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/signin', async (req, res, next) => {
  try {
    await signinStudent(req, res);
  } catch (error) {
    console.error('Signin error:', error);
    next(error);
  }
});

export default router;

