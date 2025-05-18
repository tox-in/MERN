import { Request, Response } from "express";
import prisma from "../../prisma/prisma-client";
import { CreateActionDTO, UpdateActionDTO } from "../dtos/action.dto";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";


const createAction = async (req: Request, res: Response) => {
  const dto = plainToInstance(CreateActionDTO, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    if(vehicle.isAvailable === false && dto.actionType !== "RETURN"){
        return res.status(400).json({ message: "Vehicle is not available" });
    }

    const request = await prisma.vehicleRequest.create({
      data: {
        userId: dto.userId,
        vehicleId: dto.vehicleId,
        actionType: dto.actionType,
        status: "PENDING",
      },
    });

    return res.status(201).json({ message: "Request submitted wait for Admin to approve", request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating vehicle request", error });
  }
};


const getActions = async (req: Request, res: Response) => {
  try {
    const actions = await prisma.action.findMany({
      orderBy: {
        timestamp: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            names: true,
            email: true,
          },
        },
        vehicle: {
          include: {
            model: true,
          },
        },
      },
    });
    return res.status(200).json(actions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch actions", error });
  }
};


const getActionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const action = await prisma.action.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            names: true,
            email: true,
          },
        },
        vehicle: {
          include: {
            model: true,
          },
        },
      },
    });

    if (!action) {
      return res.status(404).json({ message: "Action not found" });
    }

    return res.status(200).json(action);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch action", error });
  }
};




const updateAction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto = plainToInstance(UpdateActionDTO, req.body);
  const errors = await validate(dto, { skipMissingProperties: true });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const action = await prisma.action.findUnique({ where: { id } });
    if (!action) {
      return res.status(404).json({ message: "Action not found" });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: dto.vehicleId || action.vehicleId },
    });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if action is changing to BOOK or USE and the vehicle is unavailable
    if (
      (dto.actionType === "BOOK" || dto.actionType === "USE") &&
      !vehicle.isAvailable
    ) {
      return res
        .status(400)
        .json({ message: "Vehicle is not available for this action type" });
    }

    const updatedAction = await prisma.action.update({
      where: { id },
      data: {
        userId: dto.userId ?? action.userId,
        vehicleId: dto.vehicleId ?? action.vehicleId,
        actionType: dto.actionType ?? action.actionType,
      },
    });

    // Update vehicle availability based on the new action type
    if (dto.actionType === "BOOK" || dto.actionType === "USE") {
      await prisma.vehicle.update({
        where: { id: updatedAction.vehicleId },
        data: { isAvailable: false },
      });
    }

    if (dto.actionType === "RETURN") {
      // Do NOT mark available yet, wait for admin approval via VehicleRequest
    }

    return res.status(200).json(updatedAction);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update action", error });
  }
};


const deleteAction = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.action.delete({
            where: { id },
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete action", error });
    }
};

const actionController = {
    createAction,
    getActions,
    getActionById,
    updateAction,
    deleteAction,
};

export default actionController;
