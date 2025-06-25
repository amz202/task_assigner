ALTER TYPE "public"."task_status" ADD VALUE 'in_progress';--> statement-breakpoint
ALTER TABLE "task_logs" DROP CONSTRAINT "task_logs_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "task_logs" ADD CONSTRAINT "task_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;