const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skillController");

router.post("/", skillController.addSkill);
router.get("/", skillController.getAllSkills);
router.get("/employee/:employeeId", skillController.getSkillsByEmployeeId);
router.put("/:id", skillController.updateSkill);
router.post("/:id/certification", skillController.addCertification);
router.post("/:id/training", skillController.addTraining);
router.patch("/:id/endorse", skillController.endorseSkill);
router.delete("/:id", skillController.deleteSkill);

module.exports = router;
