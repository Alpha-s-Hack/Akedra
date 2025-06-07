import { Request, Response } from "express";
import Student from "../models/Student";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/db.config";

export const registerStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, dob, email, country, password } = req.body;

    if (!name || !dob || !email || !country || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePhoto = req.file?.filename;
    console.log(profilePhoto);

    const student = new Student({
      name,
      dob,
      email,
      country,
      profilePhoto,
      password: hashedPassword,
    });

    await student.save();

    const token = jwt.sign(
      { id: student._id, email: student.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      token,
      student: { id: student._id, name: student.name, email: student.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
