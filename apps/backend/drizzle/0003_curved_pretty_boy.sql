CREATE TABLE "job_titles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_titles_code_unique" UNIQUE("code"),
	CONSTRAINT "job_titles_label_unique" UNIQUE("label")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "job_title_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_job_title_id_job_titles_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_titles"("id") ON DELETE no action ON UPDATE no action;