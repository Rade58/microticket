"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOutRouter = void 0;
var express_1 = require("express");
var router = express_1.Router();
exports.signOutRouter = router;
// MISLIM DA OVO MOZE BITI GET REQUEST, NE MORA POST
// JER NAM NE TREBA NIKAKAV DATA
router.get("/api/users/signout", function (req, res) {
    req.session = null;
    // POSLACEMO SAMO EMPTY OBJECT U RESPONSE-U
    res.send({});
});
