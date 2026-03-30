import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import remindersRouter from "./reminders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(remindersRouter);

export default router;
