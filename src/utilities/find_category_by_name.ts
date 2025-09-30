import { BadRequestException, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { db } from "src/db/db";
import { categories, wallets } from "src/db/schema";

 export async function findCategoryByName(name: string) {
    if(!name) { throw new BadRequestException('Tên danh mục không hợp lệ'); }
    const [find_category_by_name] = await db.select({
        categoryId: categories.categoryId,
        categoryWalletId: categories.categoryWalletId,
        categoryName: categories.categoryName,
        categoryIcon: categories.categoryIcon,
    }).from(categories)
    .innerJoin(wallets, eq(categories.categoryWalletId, wallets.walletId))
    .where(and(eq(categories.categoryName, name), eq(categories.categoryIsDeleted, false)))
    .limit(1);
    if(!find_category_by_name) { throw new NotFoundException('Không tìm thấy danh mục'); }
    return find_category_by_name;
 }