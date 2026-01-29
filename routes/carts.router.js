import { Router } from "express";
import { cartManager } from "../managers/cartManager.js";

const router = Router();

// Crear carrito
router.post("/", async (req, res) => {
    const cart = await cartManager.createCart();
    res.status(201).json(cart);
});

// Obtener carrito
router.get("/:cid", async (req, res) => {
    const cart = await cartManager.getCartById(req.params.cid);
    res.json(cart ?? { error: "Carrito no encontrado" });
});

// Agregar producto
router.post("/:cid/product/:pid", async (req, res) => {
    const cart = await cartManager.addProductToCart(
        req.params.cid,
        req.params.pid
    );

    res.json(cart ?? { error: "Carrito o producto no encontrado" });
});

// Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    const cart = await cartManager.removeProduct(req.params.cid, req.params.pid);
    res.json(cart ?? { error: "Carrito o producto no encontrado" });
});

// Reemplazar todos los productos del carrito
router.put("/:cid", async (req, res) => {
    const cart = await cartManager.replaceProducts(req.params.cid, req.body.products ?? []);
    res.json(cart ?? { error: "Carrito no encontrado" });
});

// Actualizar la cantidad de un producto específico
router.put("/:cid/products/:pid", async (req, res) => {
    const cart = await cartManager.updateProductQuantity(
        req.params.cid,
        req.params.pid,
        req.body.quantity
    );
    res.json(cart ?? { error: "Carrito o producto no encontrado" });
});

// Vaciar el carrito
router.delete("/:cid", async (req, res) => {
    const cart = await cartManager.clearCart(req.params.cid);
    res.json(cart ?? { error: "Carrito no encontrado" });
});

export default router;
