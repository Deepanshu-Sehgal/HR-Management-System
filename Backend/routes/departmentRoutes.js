const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const departmentController = require("../controllers/departmentController");

router.post("/", authMiddleware, authorize("admin", "hr"), departmentController.createDepartment);
router.get("/", authMiddleware, departmentController.getAllDepartments);
router.get("/:id", authMiddleware, departmentController.getDepartmentById);
router.put("/:id", authMiddleware, authorize("admin", "hr"), departmentController.updateDepartment);
router.delete("/:id", authMiddleware, authorize("admin", "hr"), departmentController.deleteDepartment);

module.exports = router;
