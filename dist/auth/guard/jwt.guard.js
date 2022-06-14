"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwTGuard = void 0;
const passport_1 = require("@nestjs/passport");
class JwTGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor() {
        super();
    }
}
exports.JwTGuard = JwTGuard;
//# sourceMappingURL=jwt.guard.js.map