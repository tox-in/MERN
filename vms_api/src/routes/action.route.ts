import { Router } from "express";
import actionController from "../controllers/action.controller";
import { checkAdmin, checkLoggedIn } from "../middlewares/auth.middleware";
import { validationMiddleware } from "../middlewares/validator.middleware";
import { CreateActionDTO, UpdateActionDTO } from "../dtos/action.dto";

const router = Router();

router.post("/", checkLoggedIn, validationMiddleware(CreateActionDTO), actionController.createAction);
router.get("/", actionController.getActions);
router.get("/:id", checkLoggedIn, actionController.getActionById);
router.put("/:id", checkLoggedIn, validationMiddleware(UpdateActionDTO, true), actionController.updateAction);
router.delete("/:id", checkLoggedIn, actionController.deleteAction);

export default router;
