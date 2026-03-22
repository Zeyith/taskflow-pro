CREATE TABLE "incident_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"severity" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_by" uuid NOT NULL,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "incident_rooms" ADD CONSTRAINT "incident_rooms_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_rooms" ADD CONSTRAINT "incident_rooms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incident_rooms_project_id_idx" ON "incident_rooms" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "incident_rooms_status_idx" ON "incident_rooms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incident_rooms_severity_idx" ON "incident_rooms" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "incident_rooms_deleted_at_idx" ON "incident_rooms" USING btree ("deleted_at");