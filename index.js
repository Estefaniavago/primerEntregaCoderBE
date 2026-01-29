//Importaciones iniciales
import "dotenv/config";
import express from "express";
import handlebars from "express-handlebars";//motor de plantillas para renderizar html dinamico
import mongoose from "mongoose";
import { Server } from "socket.io";//permite comunicacion en tiempo real (websocket)
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import { initializePassport } from "./managers/passport.js";

// Routers

//viewsrouter maneja rutas que retornan vistas
import viewsRouter from "./routes/views.router.js";

//API Rest de productos
//imjetsocket función que permite pasarle io al router de productos.
import productsRouter, { injectSocket } from "./routes/products.router.js";

//API Rest de carritos
import cartsRouter from "./routes/carts.router.js";

// 🔥 Router de sesiones
import sessionsRouter from "./routes/sessions.router.js";

// Instancia compartida 
import { productManager } from "./managers/productManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Creacion de app y puerto
const app = express();
const PORT = 8080;
const MONGO_URL = process.env.MONGO_URL;

initializePassport();
app.use(passport.initialize());

// Middlewares. Permiten recibir json en body y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Handlebars y vistas en views
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas HTTP
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter); // 👈 ESTA ES LA NUEVA

// Inicio de servidor + conexión a MongoDB
const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Conectado a MongoDB");

        const httpServer = app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });

        // SOCKET.IO
        const io = new Server(httpServer);

        // Se inyecta socket en router de productos
        injectSocket(io);

        //Manejo de conexiones en tiempo real
        io.on("connection", async (socket) => {
            console.log("Cliente conectado");

            //Envio de lista inciial
            socket.emit("product_list", await productManager.getProducts());

            //El ciente envia addproduct
            socket.on("add_product", async (data) => {
                await productManager.addProduct(data);
                io.emit("product_list", await productManager.getProducts());
            });

            socket.on("delete_product", async (id) => {
                await productManager.deleteProduct(id);
                io.emit("product_list", await productManager.getProducts());
            });
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
        process.exit(1);
    }
};

startServer();
