CREATE TABLE "clientFavourite" (
	"id" text PRIMARY KEY NOT NULL,
	"clientSessionId" text NOT NULL,
	"photoId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientSession" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"catalogueId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clientFavourite" ADD CONSTRAINT "clientFavourite_clientSessionId_clientSession_id_fk" FOREIGN KEY ("clientSessionId") REFERENCES "public"."clientSession"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientFavourite" ADD CONSTRAINT "clientFavourite_photoId_photo_id_fk" FOREIGN KEY ("photoId") REFERENCES "public"."photo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientSession" ADD CONSTRAINT "clientSession_catalogueId_catalogue_id_fk" FOREIGN KEY ("catalogueId") REFERENCES "public"."catalogue"("id") ON DELETE no action ON UPDATE no action;