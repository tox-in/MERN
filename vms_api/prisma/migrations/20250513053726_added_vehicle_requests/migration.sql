-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "vehicle_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "action_type" "action_types" NOT NULL,
    "status" "request_status" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "vehicle_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicle_requests" ADD CONSTRAINT "vehicle_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_requests" ADD CONSTRAINT "vehicle_requests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
