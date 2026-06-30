const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const skillController = require("../controllers/skillController");

router.post("/", authMiddleware, authorize("admin", "hr"), skillController.addSkill);
router.get("/", authMiddleware, authorize("admin", "hr", "employee"), skillController.getAllSkills);
router.get("/employee/:employeeId", authMiddleware, skillController.getSkillsByEmployeeId);
router.put("/:id", authMiddleware, authorize("admin", "hr"), skillController.updateSkill);
router.post("/:id/certification", authMiddleware, authorize("admin", "hr"), skillController.addCertification);
router.post("/:id/training", authMiddleware, authorize("admin", "hr"), skillController.addTraining);
router.patch("/:id/endorse", authMiddleware, authMiddleware, skillController.endorseSkill);
router.delete("/:id", authMiddleware, authorize("admin", "hr"), skillController.deleteSkill);

module.exports = router;
