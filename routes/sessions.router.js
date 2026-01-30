import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

import { register, login } from "../managers/sessions.manager.js"

const router = Router();

router.post("/register", register);

router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  login
);

// /api/sessions/current
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      status: "success",
      user: {
        id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role
      }
    });
  }
);


router.get("/current-debug", (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    res.json({ decoded });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

export default router;
