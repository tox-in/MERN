import { Router } from "express";
import vehicleController from "../controllers/vehicle.controller";
import { checkAdmin, checkLoggedIn } from "../middlewares/auth.middleware";
import { validationMiddleware } from "../middlewares/validator.middleware";
import { CreateVehicleDTO, UpdateVehicleDTO } from "../dtos/vehicle.dto";

const router = Router();

router.post("/", checkAdmin, validationMiddleware(CreateVehicleDTO), vehicleController.createVehicle);
router.get("/",checkLoggedIn,vehicleController.getVehicles);
router.get("/allReq", checkAdmin, vehicleController.getVehicleRequests);
router.get("/search",checkLoggedIn, vehicleController.searchVehicles);
router.get("/paginated", vehicleController.getAllVehiclesPaginated);
router.get("/:id", checkLoggedIn,vehicleController.getVehicleById);
router.put("/:id", checkAdmin, validationMiddleware(UpdateVehicleDTO, true), vehicleController.updateVehicle);
router.put("/approve/:id",checkAdmin, vehicleController.approveVehicleRequest);
router.delete("/:id", checkAdmin, vehicleController.deleteVehicle);

export default router;
