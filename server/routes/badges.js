const express = require("express");
const router = express.Router();

const UserBadge = require("../models/UserBadge");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const availableBadges = require("../utils/badges");


// =============================
// GET MY BADGES
// =============================
router.get("/me", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const userBadges = await UserBadge.find({ userId });

        // attach badge info
        const result = userBadges.map(ub => {
            const badge = availableBadges.find(b => b.id === ub.badgeId);
            return {
                ...badge,
                earnedAt: ub.earnedAt
            };
        });

        res.json(result);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// CHECK & AWARD BADGES
// =============================
router.post("/check", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // count completed tasks
        const completedTasks = await Task.find({
            status: "done",
            $or: [
                { assignedToUser: userId },
                { assignedToClass: { $exists: true } },
                { assignedToGroup: { $exists: true } }
            ]
        });

        const count = completedTasks.length;

        let newlyEarned = [];

        for (let badge of availableBadges) {
            if (count >= badge.tasksRequired) {
                const exists = await UserBadge.findOne({
                    userId,
                    badgeId: badge.id
                });

                if (!exists) {
                    const newBadge = await UserBadge.create({
                        userId,
                        badgeId: badge.id
                    });

                    newlyEarned.push(badge);
                }
            }
        }

        res.json({
            completedTasks: count,
            newBadges: newlyEarned
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;