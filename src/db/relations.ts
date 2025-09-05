import { relations } from "drizzle-orm/relations";
import { users, wallets, walletMembers, categories, expenses, expenseSplits, settlements, refreshTokens } from "./schema";

export const walletsRelations = relations(wallets, ({one, many}) => ({
	user: one(users, {
		fields: [wallets.walletCreatedBy],
		references: [users.userId]
	}),
	walletMembers: many(walletMembers),
	categories: many(categories),
	expenses: many(expenses),
	settlements: many(settlements),
}));

export const usersRelations = relations(users, ({many}) => ({
	wallets: many(wallets),
	walletMembers: many(walletMembers),
	expenseSplits: many(expenseSplits),
	refreshTokens: many(refreshTokens),
}));

export const walletMembersRelations = relations(walletMembers, ({one, many}) => ({
	user: one(users, {
		fields: [walletMembers.memberUserId],
		references: [users.userId]
	}),
	wallet: one(wallets, {
		fields: [walletMembers.memberWalletId],
		references: [wallets.walletId]
	}),
	expenses: many(expenses),
	settlements_settlementPayerId: many(settlements, {
		relationName: "settlements_settlementPayerId_walletMembers_memberId"
	}),
	settlements_settlementReceiverId: many(settlements, {
		relationName: "settlements_settlementReceiverId_walletMembers_memberId"
	}),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	wallet: one(wallets, {
		fields: [categories.categoryWalletId],
		references: [wallets.walletId]
	}),
	expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({one, many}) => ({
	category: one(categories, {
		fields: [expenses.expenseCategoryId],
		references: [categories.categoryId]
	}),
	walletMember: one(walletMembers, {
		fields: [expenses.expensePayerId],
		references: [walletMembers.memberId]
	}),
	wallet: one(wallets, {
		fields: [expenses.expenseWalletId],
		references: [wallets.walletId]
	}),
	expenseSplits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({one}) => ({
	expense: one(expenses, {
		fields: [expenseSplits.splitExpenseId],
		references: [expenses.expenseId]
	}),
	user: one(users, {
		fields: [expenseSplits.splitUserId],
		references: [users.userId]
	}),
}));

export const settlementsRelations = relations(settlements, ({one}) => ({
	walletMember_settlementPayerId: one(walletMembers, {
		fields: [settlements.settlementPayerId],
		references: [walletMembers.memberId],
		relationName: "settlements_settlementPayerId_walletMembers_memberId"
	}),
	walletMember_settlementReceiverId: one(walletMembers, {
		fields: [settlements.settlementReceiverId],
		references: [walletMembers.memberId],
		relationName: "settlements_settlementReceiverId_walletMembers_memberId"
	}),
	wallet: one(wallets, {
		fields: [settlements.settlementWalletId],
		references: [wallets.walletId]
	}),
}));

export const refreshTokensRelations = relations(refreshTokens, ({one}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.userId]
	}),
}));