import { AuthGuard } from "@nestjs/passport";

export class JwTGuard extends AuthGuard('jwt') {
    constructor() {
        super();
    }
}