import { pgTable, unique, uuid, text, timestamp, boolean, foreignKey, varchar, check, numeric, index, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const transactionStatus = pgEnum("transaction_status", ['pending', 'completed', 'failed'])
export const transactionType = pgEnum("transaction_type", ['deposit', 'withdrawal', 'refund'])
export const userRoleType = pgEnum("user_role_type", ['admin', 'client'])


export const users = pgTable("users", {
	userId: uuid("user_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userFullName: text("user_full_name").notNull(),
	userEmail: text("user_email").notNull(),
	userHashedPassword: text("user_hashed_password").notNull(),
	userAvatarUrl: text("user_avatar_url"),
	userCreatedAt: timestamp("user_created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userUpdatedAt: timestamp("user_updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userIsDeleted: boolean("user_is_deleted").default(false).notNull(),
	userRole: userRoleType("user_role").default('client').notNull(),
}, (table) => [
	unique("users_user_email_key").on(table.userEmail),
]);

export const wallets = pgTable("wallets", {
	walletId: uuid("wallet_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	walletName: text("wallet_name").notNull(),
	walletDescription: text("wallet_description"),
	walletCurrency: varchar("wallet_currency", { length: 3 }).default('VND').notNull(),
	walletCreatedBy: uuid("wallet_created_by").notNull(),
	walletCreatedAt: timestamp("wallet_created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	walletUpdatedAt: timestamp("wallet_updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	walletQrCode: text("wallet_qr_code"),
	walletIsDeleted: boolean("wallet_is_deleted").default(false),
}, (table) => [
	foreignKey({
			columns: [table.walletCreatedBy],
			foreignColumns: [users.userId],
			name: "wallets_wallet_created_by_fkey"
		}),
]);

export const walletMembers = pgTable("wallet_members", {
	memberId: uuid("member_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	memberWalletId: uuid("member_wallet_id").notNull(),
	memberUserId: uuid("member_user_id").notNull(),
	memberRole: text("member_role").default('member').notNull(),
	memberJoinedAt: timestamp("member_joined_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	memberIsDeleted: boolean("member_is_deleted").default(false),
}, (table) => [
	foreignKey({
			columns: [table.memberUserId],
			foreignColumns: [users.userId],
			name: "wallet_members_member_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.memberWalletId],
			foreignColumns: [wallets.walletId],
			name: "wallet_members_member_wallet_id_fkey"
		}).onDelete("cascade"),
	unique("wallet_members_member_wallet_id_member_user_id_key").on(table.memberWalletId, table.memberUserId),
]);

export const categories = pgTable("categories", {
	categoryId: uuid("category_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryWalletId: uuid("category_wallet_id"),
	categoryName: text("category_name").default('null').notNull(),
	categoryIcon: text("category_icon"),
	categoryCreatedAt: timestamp("category_created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	categoryIsDeleted: boolean("category_is_deleted").default(false),
}, (table) => [
	foreignKey({
			columns: [table.categoryWalletId],
			foreignColumns: [wallets.walletId],
			name: "categories_category_wallet_id_fkey"
		}).onDelete("cascade"),
	unique("categories_category_wallet_id_category_name_key").on(table.categoryWalletId, table.categoryName),
]);

export const expenses = pgTable("expenses", {
	expenseId: uuid("expense_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	expenseWalletId: uuid("expense_wallet_id").notNull(),
	expenseCategoryId: uuid("expense_category_id"),
	expensePayerId: uuid("expense_payer_id").notNull(),
	expenseDescription: text("expense_description").notNull(),
	expenseAmount: numeric("expense_amount", { precision: 15, scale:  2 }).notNull(),
	expenseDate: timestamp("expense_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	expenseCreatedAt: timestamp("expense_created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	expenseUpdatedAt: timestamp("expense_updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.expenseCategoryId],
			foreignColumns: [categories.categoryId],
			name: "expenses_expense_category_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.expensePayerId],
			foreignColumns: [walletMembers.memberId],
			name: "expenses_expense_payer_id_fkey"
		}),
	foreignKey({
			columns: [table.expenseWalletId],
			foreignColumns: [wallets.walletId],
			name: "expenses_expense_wallet_id_fkey"
		}).onDelete("cascade"),
	check("expenses_expense_amount_check", sql`expense_amount > (0)::numeric`),
]);

export const expenseSplits = pgTable("expense_splits", {
	splitId: uuid("split_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	splitExpenseId: uuid("split_expense_id").notNull(),
	splitUserId: uuid("split_user_id").notNull(),
	splitAmount: numeric("split_amount", { precision: 15, scale:  2 }).notNull(),
	splitIsSettled: boolean("split_is_settled").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.splitExpenseId],
			foreignColumns: [expenses.expenseId],
			name: "expense_splits_split_expense_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.splitUserId],
			foreignColumns: [users.userId],
			name: "expense_splits_split_user_id_fkey"
		}),
	unique("expense_splits_split_expense_id_split_user_id_key").on(table.splitExpenseId, table.splitUserId),
	check("expense_splits_split_amount_check", sql`split_amount > (0)::numeric`),
]);

export const walletTransactions = pgTable("wallet_transactions", {
	transactionId: uuid("transaction_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	transactionWalletId: uuid("transaction_wallet_id").notNull(),
	transactionUserId: uuid("transaction_user_id").notNull(),
	transactionAmount: numeric("transaction_amount", { precision: 15, scale:  2 }).notNull(),
	transactionType: transactionType("transaction_type").notNull(),
	transactionStatus: transactionStatus("transaction_status").default('pending').notNull(),
	transactionProvider: text("transaction_provider"),
	transactionReference: text("transaction_reference"),
	transactionNotes: text("transaction_notes"),
	transactionCreatedAt: timestamp("transaction_created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	transactionUpdatedAt: timestamp("transaction_updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_wallet_transactions_user_id").using("btree", table.transactionUserId.asc().nullsLast().op("uuid_ops")),
	index("idx_wallet_transactions_wallet_id").using("btree", table.transactionWalletId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.transactionUserId],
			foreignColumns: [users.userId],
			name: "wallet_transactions_transaction_user_id_fkey"
		}),
	foreignKey({
			columns: [table.transactionWalletId],
			foreignColumns: [wallets.walletId],
			name: "wallet_transactions_transaction_wallet_id_fkey"
		}).onDelete("cascade"),
]);

export const walletBalances = pgTable("wallet_balances", {
	balanceId: uuid("balance_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	balanceWalletId: uuid("balance_wallet_id").notNull(),
	balanceUserId: uuid("balance_user_id").notNull(),
	balanceAmount: numeric("balance_amount", { precision: 15, scale:  2 }).default('0').notNull(),
	balanceUpdatedAt: timestamp("balance_updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_wallet_balances_wallet_user").using("btree", table.balanceWalletId.asc().nullsLast().op("uuid_ops"), table.balanceUserId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.balanceUserId],
			foreignColumns: [users.userId],
			name: "wallet_balances_balance_user_id_fkey"
		}),
	foreignKey({
			columns: [table.balanceWalletId],
			foreignColumns: [wallets.walletId],
			name: "wallet_balances_balance_wallet_id_fkey"
		}).onDelete("cascade"),
	unique("wallet_balances_balance_wallet_id_balance_user_id_key").on(table.balanceWalletId, table.balanceUserId),
]);

export const settlements = pgTable("settlements", {
	settlementId: uuid("settlement_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	settlementWalletId: uuid("settlement_wallet_id").notNull(),
	settlementPayerId: uuid("settlement_payer_id").notNull(),
	settlementReceiverId: uuid("settlement_receiver_id").notNull(),
	settlementAmount: numeric("settlement_amount", { precision: 15, scale:  2 }).notNull(),
	settlementDate: timestamp("settlement_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isPaid: boolean("is_paid").default(false),
}, (table) => [
	foreignKey({
			columns: [table.settlementPayerId],
			foreignColumns: [walletMembers.memberId],
			name: "settlements_settlement_payer_id_fkey"
		}),
	foreignKey({
			columns: [table.settlementReceiverId],
			foreignColumns: [walletMembers.memberId],
			name: "settlements_settlement_receiver_id_fkey"
		}),
	foreignKey({
			columns: [table.settlementWalletId],
			foreignColumns: [wallets.walletId],
			name: "settlements_settlement_wallet_id_fkey"
		}).onDelete("cascade"),
	check("settlements_check", sql`settlement_payer_id <> settlement_receiver_id`),
	check("settlements_settlement_amount_check", sql`settlement_amount > (0)::numeric`),
]);

export const refreshTokens = pgTable("refresh_tokens", {
	refreshId: uuid("refresh_id").defaultRandom().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	expDate: timestamp("exp_date", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "refresh_tokens_user_id_fkey"
		}),
	primaryKey({ columns: [table.refreshId, table.userId], name: "refresh_tokens_pkey"}),
	unique("refresh_tokens_user_id_key").on(table.userId),
]);
