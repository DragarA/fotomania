CREATE TYPE "public"."catalogue_status" AS ENUM('draft', 'published', 'deleted');--> statement-breakpoint
ALTER TABLE "catalogue" ADD COLUMN "status" "catalogue_status" DEFAULT 'draft' NOT NULL;