"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = require("mongoose");
var password_1 = require("../utils/password");
var userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
}, 
// EVO U OVOM OPTIONS OBJEKTU ZADAJEM
// `toJSON` (CAK KADA SI PRITISNUO Ctrl + Space
// IMAO SI PONUUDJENO, STO ZNACI DA OVO LJUDI DOSTA KORISTE
//  PA ZATO JE I TYPED)
{
    toJSON: {
        // OVDE SETTOVANJEM OVIH PROPERTIJA POMAZEM MONGOOSE-U
        // DA UZME USER DOCUMENT I PRETVORI GA U JSON
        // KAKO FUNKCIONISU METODE KOJE SU OVDE MOZES OTKRITI
        // PREKO Ctrl + Alt + Click NA toJson
        // KORISTICU transform METODU
        transform: function (doc, ret, options) {
            // doc JE DOKUMENT OBTAINEED IZ DATABASE-A
            // ret JE JSON doc OBJEKTA, STO ZNACI DA JE MONGOOSE POKUSAO DA
            // NAPRAVI JSON OD DOKUMENTA
            // MI MORMO MODIFIKOVATI ret OBJECT
            // NISTA NECEMO RETURN-OVATI SAMO DIREKTNO MENJAMO ret
            // UKLONICEMO password JER NE ZELIM ODA SE ON POJAVI
            // UBILO KOJOJ JSON REPREZENTACIJI
            // TO RADIMO TAKO STI KORISTIMO delete OPERATOR
            delete ret.password;
            // UKLONICEMO I __v
            delete ret.__v;
            // A DODAJEMO id PROPERI
            ret.id = ret._id;
            // UKLANJAMO _id
            delete ret._id;
        },
    },
});
/**
 * @description useless don't use it anywhere
 * @deprecated
 */
userSchema.statics.buildUser = function (inputs) {
    return __awaiter(this, void 0, void 0, function () {
        var User, newUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    User = this;
                    return [4 /*yield*/, User.create(inputs)];
                case 1:
                    newUser = _a.sent();
                    return [2 /*return*/, { email: newUser.email, password: newUser.password }];
            }
        });
    });
};
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var doc, password, hashedPassword;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!this.isModified("password"))
                        return [2 /*return*/, next()];
                    doc = this;
                    password = doc.get("password");
                    return [4 /*yield*/, password_1.Password.toHash(password)];
                case 1:
                    hashedPassword = _a.sent();
                    doc.set("password", hashedPassword);
                    next();
                    return [2 /*return*/];
            }
        });
    });
});
var User = mongoose_1.model("User", userSchema);
exports.User = User;
