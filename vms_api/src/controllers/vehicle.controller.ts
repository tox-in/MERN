import { Request, Response } from "express";
import prisma from "../../prisma/prisma-client";
import { CreateVehicleDTO, UpdateVehicleDTO } from "../dtos/vehicle.dto";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

const createVehicle = async (req: Request, res: Response) => {
    const dto = plainToInstance(CreateVehicleDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    const existingVehicle = await prisma.vehicle.findFirst({
        where: {
            plateNumber: dto.plateNumber,
        },
    });
    if (existingVehicle) {
        return res.status(400).json({ message: "Vehicle with this plate number already exists" });
    }

    try {
        const vehicle = await prisma.vehicle.create({
            data: {
                plateNumber: dto.plateNumber,
                color: dto.color,
                modelId: dto.modelId,
            },
        });
        return res.status(201).json(vehicle);
    } catch (error) {
        return res.status(500).json({ message: "Failed to create vehicle", error });
    }
};

const getVehicles = async (req: Request, res: Response) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
          include: {
            model: true, 
          },
        });
        return res.status(200).json(vehicles);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch vehicles", error });
    }
};

const getAllVehiclesPaginated = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
        const [vehicles, total] = await prisma.$transaction([
          prisma.vehicle.findMany({
            skip,
            take: limit,
            include: {
              model: true, 
            },
          }),
          prisma.vehicle.count(),
        ]);

        return res.status(200).json({
            data: vehicles,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch paginated vehicles", error });
    }
};

const getVehicleById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
        });
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        return res.status(200).json(vehicle);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch vehicle", error });
    }
};

const updateVehicle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto = plainToInstance(UpdateVehicleDTO, req.body);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                plateNumber: dto.plateNumber,
                color: dto.color,
                modelId: dto.modelId,
                isAvailable: dto.isAvailable,
            },
        });
        return res.status(200).json(vehicle);
    } catch (error) {
        return res.status(500).json({ message: "Failed to update vehicle", error });
    }
};

const deleteVehicle = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.vehicle.delete({
            where: { id },
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete vehicle", error });
    }
};

const searchVehicles = async (req: Request, res: Response) => {
    const { plateNumber, color, modelId } = req.query;

    const filters: any = {};
    if (plateNumber) {
        filters.plateNumber = { contains: plateNumber as string, mode: "insensitive" };
    }
    if (color) {
        filters.color = { contains: color as string, mode: "insensitive" };
    }
    if (modelId) {
        filters.modelId = modelId as string;
    }

    try {
        const vehicles = await prisma.vehicle.findMany({
            where: filters,
        });
        return res.status(200).json(vehicles);
    } catch (error) {
        return res.status(500).json({ message: "Failed to search vehicles", error });
    }
};


const approveVehicleRequest = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const request = await prisma.vehicleRequest.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({ message: "Request already processed" });
    }

    await prisma.vehicleRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    // Create Action
    await prisma.action.create({
      data: {
        userId: request.userId,
        vehicleId: request.vehicleId,
        actionType: request.actionType,
      },
    });

    // Update vehicle availability
    if (request.actionType === "BOOK" || request.actionType === "USE") {
      await prisma.vehicle.update({
        where: { id: request.vehicleId },
        data: { isAvailable: false },
      });
    } else if (request.actionType === "RETURN") {
      await prisma.vehicle.update({
        where: { id: request.vehicleId },
        data: { isAvailable: true },
      });
    }

    return res.status(200).json({ message: "Request approved" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error approving request", error });
  }
};


const getVehicleRequests = async (req: Request, res: Response) => {
  try {
    const vehicleRequests = await prisma.vehicleRequest.findMany({
      include: {
        vehicle: true,
        user: true,
      },
    });
    return res.status(200).json(vehicleRequests);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch vehicle requests", error });
  }
};



const vehicleController = {
    createVehicle,
    getVehicles,
    getAllVehiclesPaginated,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    searchVehicles,
    approveVehicleRequest,
    getVehicleRequests,
};

export default vehicleController;
