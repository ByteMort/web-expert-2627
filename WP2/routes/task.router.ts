import express from "express";
import { addTaskToUser, getMyTasks, taskUser } from "../controllers/task.controller.js";

const router = express.Router();

router.get("/tasks", getMyTasks);
router.route("/task-user")
.get(taskUser)
.post(addTaskToUser);

export default router;