import { Router } from "express";
import passport from "passport";

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
  passport.authenticate("current", { session: false }),
  (req, res) => {
    res.json({
      status: "success",
      user: req.user
    });
  }
);
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
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
