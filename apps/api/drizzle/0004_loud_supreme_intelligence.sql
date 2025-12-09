ALTER TABLE "photo" DROP CONSTRAINT "photo_mimeType_unique";--> statement-breakpoint
ALTER TABLE "photo" DROP CONSTRAINT "photo_thumbnailPath_unique";--> statement-breakpoint
ALTER TABLE "photo" DROP CONSTRAINT "photo_collectionId_collection_id_fk";
--> statement-breakpoint
ALTER TABLE "photo" ALTER COLUMN "originalFileName" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "photo" ALTER COLUMN "storagePath" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "photo" ALTER COLUMN "mimeType" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "photo" ALTER COLUMN "thumbnailPath" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "photo" ALTER COLUMN "thumbnailPath" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "photo" ADD COLUMN "size" integer;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_collectionId_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;