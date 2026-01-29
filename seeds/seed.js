import "dotenv/config";
import mongoose from "mongoose";
import { ProductModel } from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/coderhouse";

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Conectado a MongoDB, limpiando colecciones...");

    await Promise.all([ProductModel.deleteMany({}), CartModel.deleteMany({})]);

    const sampleProducts = [
      {
        title: "Laptop Pro",
        description: "14\" 16GB RAM 512GB SSD",
        code: "LAP-001",
        price: 1200,
        stock: 15,
        category: "electronics",
        status: true,
        thumbnails: []
      },
      {
        title: "Auriculares Inalámbricos",
        description: "Bluetooth 5.0 con cancelación de ruido",
        code: "AUD-001",
        price: 150,
        stock: 50,
        category: "electronics",
        status: true,
        thumbnails: []
      },
      {
        title: "Camiseta Deportiva",
        description: "Tela respirable, color negro",
        code: "CAM-001",
        price: 25,
        stock: 100,
        category: "ropa",
        status: true,
        thumbnails: []
      },
      {
        title: "Zapatillas Running",
        description: "Suela amortiguada, color azul",
        code: "ZAP-001",
        price: 80,
        stock: 60,
        category: "ropa",
        status: true,
        thumbnails: []
      },
      {
        title: "Silla de Oficina",
        description: "Ergonómica con soporte lumbar",
        code: "SIL-001",
        price: 220,
        stock: 20,
        category: "muebles",
        status: true,
        thumbnails: []
      }
    ];

    const products = await ProductModel.insertMany(sampleProducts);
    console.log(`Productos insertados: ${products.length}`);

    const cart = await CartModel.create({
      products: [
        { product: products[0]._id, quantity: 1 },
        { product: products[1]._id, quantity: 2 }
      ]
    });

    console.log("Carrito de prueba creado:", cart.id);
    console.log("Seed finalizado correctamente.");
  } catch (err) {
    console.error("Error en seed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

