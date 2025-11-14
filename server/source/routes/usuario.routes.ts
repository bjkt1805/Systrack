import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UsuarioController();

        router.post("/login", controller.login);
        router.post("/register", controller.register);
        router.get("/profile", authenticateJWT, controller.userAuth);

        //GET localhost:3000/usuario/3
        router.get('/:id', controller.getById);
        return router;
    }
}
