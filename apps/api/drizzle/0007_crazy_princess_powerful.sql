CREATE TYPE "public"."collection_type" AS ENUM('proofing', 'delivery');--> statement-breakpoint
CREATE TABLE "deliveryDownload" (
	"id" text PRIMARY KEY NOT NULL,
	"collectionId" text NOT NULL,
	"downloadedAt" timestamp NOT NULL,
	"ipAddress" varchar(45)
);
--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "type" "collection_type" DEFAULT 'proofing' NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "clientSessionId" text;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "deliverySlug" varchar(255);--> statement-breakpoint
ALTER TABLE "deliveryDownload" ADD CONSTRAINT "deliveryDownload_collectionId_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_clientSessionId_clientSession_id_fk" FOREIGN KEY ("clientSessionId") REFERENCES "public"."clientSession"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_deliverySlug_unique" UNIQUE("deliverySlug");