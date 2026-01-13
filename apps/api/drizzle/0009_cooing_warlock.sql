ALTER TABLE "user" ADD COLUMN "businessName" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "businessAddress" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "businessPhone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "businessEmail" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "businessWebsite" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "businessLogo" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "businessDescription" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferredLanguage" text DEFAULT 'en' NOT NULL;