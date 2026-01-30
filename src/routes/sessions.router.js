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
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // COOKIE SEGURA 
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // true si usás HTTPS
      maxAge: 60 * 60 * 1000
    });

    res.json({
      status: "success",
      message: "Login exitoso",
      token
    });
  }
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



export default router;
