import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { db } from 'src/db/db';
import { categories, wallets } from 'src/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { findWalletByName } from 'src/utilities/find_wallet.by_name';
import { uuid } from 'drizzle-orm/gel-core';
import { isUuid } from 'uuidv4';

@Injectable()
export class CategoriesService {

 async create(createCategoryDto: CreateCategoryDto) {
  const find_wallet = await findWalletByName(createCategoryDto.categoryWalletId);
  const [create_category] = await db.insert(categories).values({
    categoryName: createCategoryDto.categoryName,
    categoryWalletId: find_wallet.walletId,
    categoryIcon: createCategoryDto.categoryIcon,
    categoryIsDeleted: false,
  }).returning({
    categoryId: categories.categoryId,
    categoryName: categories.categoryName,
    categoryWalletId: categories.categoryWalletId,
    categoryIcon: categories.categoryIcon,
    categoryCreatedAt: categories.categoryCreatedAt
  })
  if(!create_category) { throw new BadRequestException('Tạo danh mục thất bại!'); }
  return {status: HttpStatus.CREATED, msg: `Tạo danh mục ${create_category.categoryName} thành công!`, data: create_category};
  }

 async findAll() {
    const find_list_categories = await db.select({
      categoryId: categories.categoryId,
      categoryWalletName: wallets.walletName,
      categoryName: categories.categoryName,
      categoryIcon: categories.categoryIcon
    }).from(categories)
    .innerJoin(wallets, eq(categories.categoryWalletId, wallets.walletId))
    .where(eq(categories.categoryIsDeleted, false))
    .orderBy(desc(categories.categoryCreatedAt));
    if(find_list_categories.length == 0 ) { throw new NotFoundException('Không có danh mục nào!'); }
    return {status: HttpStatus.OK, msg: `Lấy ra các danh mục thành công!`, data: find_list_categories};
  }

 async findOne(id: string) {
    const find_category_by_id = await this.findCategoryById(id);
    return {status: HttpStatus.OK, msg: `Lấy danh mục ${find_category_by_id.categoryName} thành công!`, data: find_category_by_id};
  }

 async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const find_category_by_id = await this.findCategoryById(id);
    const find_wallet = updateCategoryDto.categoryWalletId ? await findWalletByName(updateCategoryDto.categoryWalletId) : null;
    const [update_category] = await db.update(categories).set({
      ...(updateCategoryDto.categoryName && {categoryName: updateCategoryDto.categoryName}),
      ...(updateCategoryDto.categoryIcon && {categoryIcon: updateCategoryDto.categoryIcon}),
      ...(updateCategoryDto.categoryWalletId && find_wallet && {categoryWalletId: find_wallet.walletId}),
      ...(updateCategoryDto.categoryWalletId && find_wallet && {categoryWalletId: find_wallet.walletId}),
    }).where(eq(categories.categoryId, find_category_by_id.categoryId))
    .returning({
      categoryId: categories.categoryId,
      categoryName: categories.categoryName,
      categoryWalletId: categories.categoryWalletId,
      categoryIcon: categories.categoryIcon
    });
    if(!update_category) { throw new BadRequestException('Cập nhật danh mục thất bại!'); }
    return {status: HttpStatus.OK, msg: `Cập nhật danh mục ${update_category.categoryName} thành công!`, data: update_category};
  }

  async remove(id: string) {
    const find_category_by_id = await this.findCategoryById(id);
    const [delete_category] = await db.update(categories).set({
      categoryIsDeleted: true,
    }).where(eq(categories.categoryId, find_category_by_id.categoryId)).returning();
    if(!delete_category) { throw new BadRequestException('Xóa danh mục thất bại!'); }
    return {status: HttpStatus.NO_CONTENT, msg: `Xóa danh mục ${delete_category.categoryName} thành công!`};
  }

  async findCategoryById(categoryId: string) {
    if(!categoryId || !isUuid(categoryId)) { throw new BadRequestException('ID của danh mục không hợp lệ!'); }
    const [find_category_by_id] = await db.select({
      categoryId: categories.categoryId,
      categoryWalletName: wallets.walletName,
      categoryName: categories.categoryName,
      categoryIcon: categories.categoryIcon
    }).from(categories)
    .innerJoin(wallets, eq(categories.categoryWalletId, wallets.walletId))
    .where(and(eq(categories.categoryId, categoryId), eq(categories.categoryIsDeleted, false)))
     if(!find_category_by_id) { throw new NotFoundException('Không có danh mục nào!'); }
      return find_category_by_id;
    }
  }

