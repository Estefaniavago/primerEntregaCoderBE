import UserModel from "../models/user.model.js";
import { createHash } from "./bcrypt.js";
import { CartModel } from "../models/cart.model.js";
import jwt from "jsonwebtoken"
import { isValidPassword } from "./bcrypt.js"



// ======================
// REGISTER
// ======================
export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    //  Crear carrito vacío
    const newCart = await CartModel.create({ products: [] });

    const newUser = {
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
      role: "user",
      cart: newCart._id // 🔗 Referencia al carrito
    };

    const result = await UserModel.create(newUser);

    res.status(201).json({
      message: "Usuario creado con carrito",
      user: {
        id: result._id,
        email: result.email,
        cart: result.cart
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================
// LOGIN
// ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" })
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" })
    }

    const validPassword = isValidPassword(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" })
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )

    res.json({
      message: "Login exitoso",
      token
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
