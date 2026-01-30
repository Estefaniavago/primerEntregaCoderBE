import mongoose from "mongoose";
import { ProductModel } from "../models/product.model.js";

// Gestor de productos respaldado por MongoDB
class ProductManager {
  async getProducts() {
    const products = await ProductModel.find();
    return products.map((doc) => doc.toObject());
  }

  async getProductsPaginated({ limit = 10, page = 1, sort, query }) {
    const match = {};
    if (query) {
      // query puede ser categoría o disponibilidad (status)
      if (query === "available" || query === "true") match.status = true;
      else if (query === "unavailable" || query === "false") match.status = false;
      else match.category = query;
    }

    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    const numericLimit = Number(limit) > 0 ? Number(limit) : 10;
    const numericPage = Number(page) > 0 ? Number(page) : 1;

    const skip = (numericPage - 1) * numericLimit;
    const [products, total] = await Promise.all([
      ProductModel.find(match)
        .sort(sortOption)
        .skip(skip)
        .limit(numericLimit),
      ProductModel.countDocuments(match)
    ]);

    const totalPages = Math.max(1, Math.ceil(total / numericLimit));
    const payload = products.map((doc) => doc.toObject());

    return {
      payload,
      totalPages,
      page: numericPage,
      prevPage: numericPage > 1 ? numericPage - 1 : null,
      nextPage: numericPage < totalPages ? numericPage + 1 : null,
      hasPrevPage: numericPage > 1,
      hasNextPage: numericPage < totalPages
    };
  }

  async getProductById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc = await ProductModel.findById(id);
    return doc ? doc.toObject() : null;
  }

  async addProduct(product) {
    const payload = {
      title: product.title,
      description: product.description,
      code: product.code,
      price: product.price,
      status: product.status ?? true,
      stock: product.stock,
      category: product.category,
      thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : []
    };

    const created = await ProductModel.create(payload);
    return created.toObject();
  }

  async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const deleted = await ProductModel.findByIdAndDelete(id);
    return Boolean(deleted);
  }
}

export const productManager = new ProductManager();
export default ProductManager;
