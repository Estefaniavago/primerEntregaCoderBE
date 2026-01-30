import { Router } from "express";
import { productManager } from "../managers/productManager.js";
import { cartManager } from "../managers/cartManager.js";

const router = Router();

// Página principal
router.get("/", async (req, res) => {
    const products = await productManager.getProducts();
    res.render("home", {
        title: "Página de inicio",
        message: "Bienvenido a la tienda",
        products
    });
});

// Vista normal
router.get("/products", async (req, res) => {
    const { limit, page, sort, query } = req.query;
    const result = await productManager.getProductsPaginated({ limit, page, sort, query });

    res.render("products", {
        products: result.payload,
        pagination: {
            totalPages: result.totalPages,
            page: result.page,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage
                ? `/products?${new URLSearchParams({ ...req.query, page: result.prevPage }).toString()}`
                : null,
            nextLink: result.hasNextPage
                ? `/products?${new URLSearchParams({ ...req.query, page: result.nextPage }).toString()}`
                : null
        }
    });
});

// Vista realtime
router.get("/realtimeproducts", async (req, res) => {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
});

// Vista detalle de producto
router.get("/products/:pid", async (req, res) => {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) {
        return res.status(404).render("productDetail", { error: "Producto no encontrado" });
    }
    res.render("productDetail", { product });
});

// Vista carrito
router.get("/carts/:cid", async (req, res) => {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) {
        return res.status(404).render("cart", { error: "Carrito no encontrado" });
    }
    res.render("cart", { cart });
});

export default router;
