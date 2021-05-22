"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUserRouter = void 0;
var express_1 = require("express");
// UMESTO OVOGA
// import { currentUser } from "../middlewares/current-user";
// UVOZIM OVO
var common_1 = require("@ramicktick/common");
//
var router = express_1.Router();
exports.currentUserRouter = router;
router.get("/api/users/current-user", common_1.currentUser, function (req, res) {
    return res.send({
        currentUser: !req.currentUser ? null : req.currentUser,
    });
});
