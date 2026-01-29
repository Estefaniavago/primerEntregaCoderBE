import mongoose from "mongoose";
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";

class CartManager {
  async createCart() {
    const cart = await CartModel.create({ products: [] });
    return cart.toObject();
  }

  async getCartById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const cart = await CartModel.findById(id).populate("products.product");
    return cart ? cart.toObject() : null;
  }

  async addProductToCart(cartId, productId) {
    const isValidIds =
      mongoose.Types.ObjectId.isValid(cartId) &&
      mongoose.Types.ObjectId.isValid(productId);
    if (!isValidIds) return null;

    const productExists = await ProductModel.exists({ _id: productId });
    if (!productExists) return null;

    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    const existing = cart.products.find(
      (p) => p.product.toString() === productId
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    await cart.populate("products.product");

    return cart.toObject();
  }

  async removeProduct(cartId, productId) {
    const isValidIds =
      mongoose.Types.ObjectId.isValid(cartId) &&
      mongoose.Types.ObjectId.isValid(productId);
    if (!isValidIds) return null;

    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("products.product");
    return cart.toObject();
  }

  async replaceProducts(cartId, products = []) {
    if (!mongoose.Types.ObjectId.isValid(cartId)) return null;

    // Validar productos
    const sanitized = [];
    for (const item of products) {
      const { product, quantity } = item;
      if (
        !product ||
        !mongoose.Types.ObjectId.isValid(product) ||
        !(await ProductModel.exists({ _id: product }))
      ) {
        continue;
      }
      const qty = Number(quantity) > 0 ? Number(quantity) : 1;
      sanitized.push({ product, quantity: qty });
    }

    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    cart.products = sanitized;
    await cart.save();
    await cart.populate("products.product");
    return cart.toObject();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const isValidIds =
      mongoose.Types.ObjectId.isValid(cartId) &&
      mongoose.Types.ObjectId.isValid(productId);
    if (!isValidIds) return null;

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return null;

    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    const item = cart.products.find(
      (p) => p.product.toString() === productId
    );
    if (!item) return null;

    item.quantity = qty;
    await cart.save();
    await cart.populate("products.product");
    return cart.toObject();
  }

  async clearCart(cartId) {
    if (!mongoose.Types.ObjectId.isValid(cartId)) return null;
    const cart = await CartModel.findById(cartId);
    if (!cart) return null;
    cart.products = [];
    await cart.save();
    return cart.toObject();
  }
}

export const cartManager = new CartManager();
export default CartManager;
