-- CreateTable
CREATE TABLE "company" (
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "branch" (
    "code" VARCHAR(20) NOT NULL,
    "company_code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "location" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "id" TEXT NOT NULL,
    "external_id" VARCHAR(50) NOT NULL,
    "company_code" VARCHAR(20) NOT NULL,
    "branch_code" VARCHAR(20) NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "chassis_number" VARCHAR(50) NOT NULL,
    "engine_number" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_status_history" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "previous_status" VARCHAR(20) NOT NULL,
    "new_status" VARCHAR(20) NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL,
    "changed_by" VARCHAR(100) NOT NULL,
    "change_reason" VARCHAR(500),

    CONSTRAINT "vehicle_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_log" (
    "id" TEXT NOT NULL,
    "correlation_id" VARCHAR(50) NOT NULL,
    "request_timestamp" TIMESTAMP(3) NOT NULL,
    "endpoint" VARCHAR(100) NOT NULL,
    "http_method" VARCHAR(10) NOT NULL,
    "external_id" VARCHAR(50),
    "success" BOOLEAN NOT NULL,
    "http_status_code" INTEGER NOT NULL,
    "error_message" VARCHAR(500),
    "processing_time_ms" INTEGER NOT NULL,
    "request_payload_summary" VARCHAR(1000),
    "company_code" VARCHAR(20),

    CONSTRAINT "integration_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "branch_company_code_idx" ON "branch"("company_code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_chassis_number_key" ON "vehicle"("chassis_number");

-- CreateIndex
CREATE INDEX "vehicle_external_id_company_code_branch_code_idx" ON "vehicle"("external_id", "company_code", "branch_code");

-- CreateIndex
CREATE INDEX "vehicle_company_code_idx" ON "vehicle"("company_code");

-- CreateIndex
CREATE INDEX "vehicle_branch_code_idx" ON "vehicle"("branch_code");

-- CreateIndex
CREATE INDEX "vehicle_status_idx" ON "vehicle"("status");

-- CreateIndex
CREATE INDEX "vehicle_brand_model_idx" ON "vehicle"("brand", "model");

-- CreateIndex
CREATE INDEX "vehicle_updated_at_idx" ON "vehicle"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_external_id_company_code_branch_code_key" ON "vehicle"("external_id", "company_code", "branch_code");

-- CreateIndex
CREATE INDEX "vehicle_status_history_vehicle_id_idx" ON "vehicle_status_history"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_status_history_changed_at_idx" ON "vehicle_status_history"("changed_at");

-- CreateIndex
CREATE INDEX "vehicle_status_history_vehicle_id_changed_at_idx" ON "vehicle_status_history"("vehicle_id", "changed_at");

-- CreateIndex
CREATE UNIQUE INDEX "integration_log_correlation_id_key" ON "integration_log"("correlation_id");

-- CreateIndex
CREATE INDEX "integration_log_correlation_id_idx" ON "integration_log"("correlation_id");

-- CreateIndex
CREATE INDEX "integration_log_request_timestamp_idx" ON "integration_log"("request_timestamp");

-- CreateIndex
CREATE INDEX "integration_log_external_id_idx" ON "integration_log"("external_id");

-- CreateIndex
CREATE INDEX "integration_log_success_idx" ON "integration_log"("success");

-- CreateIndex
CREATE INDEX "integration_log_company_code_idx" ON "integration_log"("company_code");

-- CreateIndex
CREATE INDEX "integration_log_endpoint_request_timestamp_idx" ON "integration_log"("endpoint", "request_timestamp");

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_company_code_fkey" FOREIGN KEY ("company_code") REFERENCES "company"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_company_code_fkey" FOREIGN KEY ("company_code") REFERENCES "company"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_branch_code_fkey" FOREIGN KEY ("branch_code") REFERENCES "branch"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_status_history" ADD CONSTRAINT "vehicle_status_history_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
