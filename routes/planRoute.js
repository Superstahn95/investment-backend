const express = require("express");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const {
  createPlan,
  deletePlan,
  getPlan,
  getPlans,
  subscribeToPlan,
  updatePlan,
} = require("../controllers/planController");

const router = express.Router();

//for admin only
router.post("/", isAuth, checkUserRole("admin"), createPlan);
//non protected route for all users
router.get("/", getPlans);
//authenticated users and not for guests
router.patch("/subscribe", isAuth, subscribeToPlan);
router.get("/protected", isAuth, (req, res, next) => {
  res.send("Route accessible right now");
});
//admin only i guess
router.get("/:id", getPlan);
//admin only
router.put("/:id", isAuth, checkUserRole("admin"), updatePlan);
router.delete("/:id", isAuth, checkUserRole("admin"), deletePlan);

module.exports = router;
