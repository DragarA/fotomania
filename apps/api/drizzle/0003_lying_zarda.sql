CREATE TABLE "collection" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"catalogueId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo" (
	"id" text PRIMARY KEY NOT NULL,
	"originalFileName" varchar(100) NOT NULL,
	"storagePath" varchar(255) NOT NULL,
	"mimeType" varchar(50) NOT NULL,
	"thumbnailPath" varchar(255) NOT NULL,
	"collectionId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "photo_storagePath_unique" UNIQUE("storagePath"),
	CONSTRAINT "photo_mimeType_unique" UNIQUE("mimeType"),
	CONSTRAINT "photo_thumbnailPath_unique" UNIQUE("thumbnailPath")
);
--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_catalogueId_catalogue_id_fk" FOREIGN KEY ("catalogueId") REFERENCES "public"."catalogue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_collectionId_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE no action ON UPDATE no action;