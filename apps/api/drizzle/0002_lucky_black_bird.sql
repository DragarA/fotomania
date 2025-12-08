CREATE TABLE "catalogue" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"coverImage" text,
	"password" text,
	"publicUrlSlug" varchar(255) NOT NULL,
	"ownerId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "catalogue_publicUrlSlug_unique" UNIQUE("publicUrlSlug")
);
--> statement-breakpoint
ALTER TABLE "catalogue" ADD CONSTRAINT "catalogue_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;