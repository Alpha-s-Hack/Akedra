import { Request, Response } from 'express';
import Student from '../models/Student';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config';

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
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, dob, email, country, password } = req.body;
    const profilePhoto = req.file?.filename;

    if (!name || !dob || !email || !country || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      name,
      dob,
      email,
      country,
      profilePhoto,
      password: hashedPassword,
    });

    await student.save();

    const token = jwt.sign({ id: student._id, email: student.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      token,
      student: {
        id: String(student._id),
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

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
export const signinStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const student = await Student.findOne({ email });
    if (!student) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: student._id, email: student.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      token,
      student: {
        id: String(student._id),
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

