ALTER TABLE "clientSession" ADD COLUMN "clientName" text;--> statement-breakpoint
ALTER TABLE "clientSession" ADD COLUMN "clientAddressStreet" text;--> statement-breakpoint
ALTER TABLE "clientSession" ADD COLUMN "clientAddressCity" text;--> statement-breakpoint
ALTER TABLE "clientSession" ADD COLUMN "clientAddressPostalCode" text;--> statement-breakpoint
ALTER TABLE "clientSession" ADD COLUMN "clientAddressCountry" text;--> statement-breakpoint
ALTER TABLE "clientSession" ADD COLUMN "clientPhoneNumber" text;--> statement-breakpoint
ALTER TABLE "clientSession" ADD COLUMN "clientNotes" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "collectClientName" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "collectClientAddress" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "collectClientPhone" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "collectClientNotes" boolean DEFAULT false NOT NULL;