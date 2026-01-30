import passport from "passport";
import local from "passport-local";
import jwt from "passport-jwt";
import UserModel from "../models/user.model.js";
import { isValidPassword } from "../managers/bcrypt.js";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";


const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

export const initializePassport = () => {
  // LOGIN
  passport.use("login", new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done(null, false);
        }

        if (!isValidPassword(password, user.password)) {

          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // CURRENT (JWT)
  passport.use("current", new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "jwtSecretKey"
    },
    async (jwt_payload, done) => {
      try {
        return done(null, jwt_payload.user);
      } catch (error) {
        return done(error);
      }
    }
  ));
  passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (jwtPayload, done) => {
      try {
        const user = await UserModel.findById(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
};
