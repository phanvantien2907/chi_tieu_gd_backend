-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."user_role_type" AS ENUM('admin', 'client');--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_full_name" text NOT NULL,
	"user_email" text NOT NULL,
	"user_hashed_password" text NOT NULL,
	"user_avatar_url" text,
	"user_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_is_deleted" boolean DEFAULT false NOT NULL,
	"user_role" "user_role_type" DEFAULT 'client' NOT NULL,
	CONSTRAINT "users_user_email_key" UNIQUE("user_email")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"wallet_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"wallet_name" text NOT NULL,
	"wallet_description" text,
	"wallet_currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"wallet_created_by" uuid NOT NULL,
	"wallet_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"wallet_updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_members" (
	"member_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"member_wallet_id" uuid NOT NULL,
	"member_user_id" uuid NOT NULL,
	"member_role" text DEFAULT 'member' NOT NULL,
	"member_joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_members_member_wallet_id_member_user_id_key" UNIQUE("member_wallet_id","member_user_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"category_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"category_wallet_id" uuid,
	"category_name" text NOT NULL,
	"category_icon" text,
	"category_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_category_wallet_id_category_name_key" UNIQUE("category_wallet_id","category_name")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"expense_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"expense_wallet_id" uuid NOT NULL,
	"expense_category_id" uuid,
	"expense_payer_id" uuid NOT NULL,
	"expense_description" text NOT NULL,
	"expense_amount" numeric(15, 2) NOT NULL,
	"expense_date" timestamp with time zone DEFAULT now() NOT NULL,
	"expense_created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expense_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expenses_expense_amount_check" CHECK (expense_amount > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "expense_splits" (
	"split_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"split_expense_id" uuid NOT NULL,
	"split_user_id" uuid NOT NULL,
	"split_amount" numeric(15, 2) NOT NULL,
	"split_is_settled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "expense_splits_split_expense_id_split_user_id_key" UNIQUE("split_expense_id","split_user_id"),
	CONSTRAINT "expense_splits_split_amount_check" CHECK (split_amount > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"settlement_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"settlement_wallet_id" uuid NOT NULL,
	"settlement_payer_id" uuid NOT NULL,
	"settlement_receiver_id" uuid NOT NULL,
	"settlement_amount" numeric(15, 2) NOT NULL,
	"settlement_date" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settlements_check" CHECK (settlement_payer_id <> settlement_receiver_id),
	CONSTRAINT "settlements_settlement_amount_check" CHECK (settlement_amount > (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_wallet_created_by_fkey" FOREIGN KEY ("wallet_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_members" ADD CONSTRAINT "wallet_members_member_user_id_fkey" FOREIGN KEY ("member_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_members" ADD CONSTRAINT "wallet_members_member_wallet_id_fkey" FOREIGN KEY ("member_wallet_id") REFERENCES "public"."wallets"("wallet_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_category_wallet_id_fkey" FOREIGN KEY ("category_wallet_id") REFERENCES "public"."wallets"("wallet_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expense_category_id_fkey" FOREIGN KEY ("expense_category_id") REFERENCES "public"."categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expense_payer_id_fkey" FOREIGN KEY ("expense_payer_id") REFERENCES "public"."wallet_members"("member_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expense_wallet_id_fkey" FOREIGN KEY ("expense_wallet_id") REFERENCES "public"."wallets"("wallet_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_splits" ADD CONSTRAINT "expense_splits_split_expense_id_fkey" FOREIGN KEY ("split_expense_id") REFERENCES "public"."expenses"("expense_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_splits" ADD CONSTRAINT "expense_splits_split_user_id_fkey" FOREIGN KEY ("split_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_settlement_payer_id_fkey" FOREIGN KEY ("settlement_payer_id") REFERENCES "public"."wallet_members"("member_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_settlement_receiver_id_fkey" FOREIGN KEY ("settlement_receiver_id") REFERENCES "public"."wallet_members"("member_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_settlement_wallet_id_fkey" FOREIGN KEY ("settlement_wallet_id") REFERENCES "public"."wallets"("wallet_id") ON DELETE cascade ON UPDATE no action;
*/