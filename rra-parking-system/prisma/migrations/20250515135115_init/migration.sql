-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DRIVER', 'GATESMAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "CarCategory" AS ENUM ('SMALL', 'MINIBUS', 'BUS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "national_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DRIVER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "company" TEXT,
    "category" "CarCategory" NOT NULL,
    "plate_number" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dept" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSession" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "entry_time" TIMESTAMP(3) NOT NULL,
    "exit_time" TIMESTAMP(3),
    "hasLeft" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "price" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "company" TEXT,
    "session_duration" INTEGER NOT NULL,
    "session_datetime" TIMESTAMP(3) NOT NULL,
    "session_price" DOUBLE PRECISION NOT NULL,
    "accumulated_debt" DOUBLE PRECISION NOT NULL,
    "sessionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_national_id_key" ON "User"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_number_key" ON "Vehicle"("plate_number");

-- CreateIndex
CREATE INDEX "Vehicle_plate_number_idx" ON "Vehicle"("plate_number");

-- CreateIndex
CREATE INDEX "Vehicle_ownerId_idx" ON "Vehicle"("ownerId");

-- CreateIndex
CREATE INDEX "ParkingSession_vehicleId_idx" ON "ParkingSession"("vehicleId");

-- CreateIndex
CREATE INDEX "ParkingSession_entry_time_idx" ON "ParkingSession"("entry_time");

-- CreateIndex
CREATE UNIQUE INDEX "Report_sessionId_key" ON "Report"("sessionId");

-- CreateIndex
CREATE INDEX "Report_vehicleId_idx" ON "Report"("vehicleId");

-- CreateIndex
CREATE INDEX "Report_sessionId_idx" ON "Report"("sessionId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ParkingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
