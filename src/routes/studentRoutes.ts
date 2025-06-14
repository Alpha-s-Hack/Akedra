import express from "expresss";
import { registerStudent } from "../controllers/studentControllerr";
import { upload } from "../middleware/uploadd";

const router = express.Router();

// Simple route handler for signup
router.post(
  "/signup",
  upload.single("profilePhoto"),
  async (req, res, next) => {
    try {
      console.log("Processing signup request");
      await registerStudent(req, res);
    } catch (error) {
      console.error("Signup error:", error);
      next(error);
    }
  }
);

export default router;
