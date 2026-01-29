import { Router } from "express";
import { productManager } from "../managers/productManager.js";

let io = null;

export function injectSocket(socketServer) {
    io = socketServer;
}

const router = Router();

router.get("/", async (req, res) => {
    const { limit, page, sort, query } = req.query;
    const result = await productManager.getProductsPaginated({ limit, page, sort, query });

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const buildLink = (targetPage) => {
        if (!targetPage) return null;
        const params = new URLSearchParams({
            ...req.query,
            page: targetPage
        }).toString();
        return `${baseUrl}?${params}`;
    };

    res.json({
        status: "success",
        payload: result.payload,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: buildLink(result.prevPage),
        nextLink: buildLink(result.nextPage)
    });
});

router.post("/", async (req, res) => {
    const newProduct = await productManager.addProduct(req.body);

    if (io) {
        io.emit("product_list", await productManager.getProducts());
    }

    res.status(201).json(newProduct);
});

router.delete("/:pid", async (req, res) => {
    const id = req.params.pid;
    const deleted = await productManager.deleteProduct(id);

    if (io) {
        io.emit("product_list", await productManager.getProducts());
    }

    if (!deleted) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ status: "success" });
});

router.get("/:pid", async (req, res) => {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
});

export default router;
