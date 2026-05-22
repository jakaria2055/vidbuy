import { and, desc, eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { products } from "../db/schema.js";
import { db } from "../db/index.js";


export async function listProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const category =
      typeof req.query.category === "string" ? req.query.category.trim() : "";

    const activeOnly = eq(products.active, true);
    const whereClause = category
      ? and(activeOnly, eq(products.category, category))
      : activeOnly;

    const rows = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt));

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      count: rows.length,
      products: rows,
    });
  } catch (e) {
    console.error("Error fetching products:", e);
    next(e);
  }
}

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const rows = await db
      .select({ category: products.category })
      .from(products)
      .where(eq(products.active, true));

    const categories = [...new Set(rows.map((r) => r.category))].sort((a, b) =>
      a.localeCompare(b),
    );

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      count: categories.length,
      categories,
    });
  } catch (e) {
    console.error("Error fetching categories:", e);
    next(e);
  }
}

export async function getProductBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.slug, req.params.slug as string))
      .limit(1);

    if (!row || !row.active) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      product: row,
    });
  } catch (e) {
    console.error("Error fetching product by slug:", e);
    next(e);
  }
}

