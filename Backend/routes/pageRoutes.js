const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const pageController = require("../controllers/pageController");

router.post(
  "/",
  authMiddleware,
  authorize("admin", "hr"),
  pageController.createPage
);
router.get(
  "/",
  authMiddleware,
  authorize("admin", "hr"),
  pageController.getPages
);
router.get("/slug/:slug", pageController.getPageBySlug);
router.get(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  pageController.getPageById
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  pageController.updatePage
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  pageController.deletePage
);

module.exports = router;
