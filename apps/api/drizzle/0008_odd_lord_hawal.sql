ALTER TABLE "clientFavourite" DROP CONSTRAINT "clientFavourite_clientSessionId_clientSession_id_fk";
--> statement-breakpoint
ALTER TABLE "clientFavourite" DROP CONSTRAINT "clientFavourite_photoId_photo_id_fk";
--> statement-breakpoint
ALTER TABLE "clientSession" DROP CONSTRAINT "clientSession_catalogueId_catalogue_id_fk";
--> statement-breakpoint
ALTER TABLE "deliveryDownload" DROP CONSTRAINT "deliveryDownload_collectionId_collection_id_fk";
--> statement-breakpoint
ALTER TABLE "clientFavourite" ADD CONSTRAINT "clientFavourite_clientSessionId_clientSession_id_fk" FOREIGN KEY ("clientSessionId") REFERENCES "public"."clientSession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientFavourite" ADD CONSTRAINT "clientFavourite_photoId_photo_id_fk" FOREIGN KEY ("photoId") REFERENCES "public"."photo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientSession" ADD CONSTRAINT "clientSession_catalogueId_catalogue_id_fk" FOREIGN KEY ("catalogueId") REFERENCES "public"."catalogue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveryDownload" ADD CONSTRAINT "deliveryDownload_collectionId_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;