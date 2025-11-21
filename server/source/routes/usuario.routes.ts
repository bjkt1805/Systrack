import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
import { authenticateJWT, authorizeRoles } from "../middleware/authMiddleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UsuarioController();

        // POST localhost:3000/usuario/login
        router.post("/login", controller.login);

        // POST localhost:3000/usuario/register
        router.post("/register", controller.register);

        // GET localhost:3000/usuario/profile
        router.get("/profile", authenticateJWT, controller.userAuth);

        //GET localhost:3000/usuario/3
        router.get('/:id', controller.getById);
        return router;

        // Estructura a seguir para rutas protegidas con JWT y con rol de Administrador 
        // router.get(
        //     'ruta',
        //     authenticateJWT,
        //     authorizeRoles(Rol.ADMIN),
        //     controller.accion
        // );
    }
}
