import type { JWTClaims } from "../middlewares/auth.middleware.ts";

declare global{
    namespace Express{
        interface Request{
            user?: JWTClaims
        }
    }
}