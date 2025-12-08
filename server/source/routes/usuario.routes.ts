import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
import { authenticateJWT, authorizeRoles } from "../middleware/authMiddleware";
import { Rol } from "../../generated/prisma";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UsuarioController();

        //GET localhost:3000/usuario/
        router.get('/', authenticateJWT, authorizeRoles(Rol.ADMIN), controller.get);

        // POST localhost:3000/usuario/login
        router.post("/login", controller.login);

        // POST localhost:3000/usuario/register
        router.post("/register", controller.register);

        // PUT localhost:3000/usuario/reset-password
        router.put("/reset-password/:nombreUsuario", controller.resetPassword);

        // PUT localhost:3000/usuario/edit
        router.put("/:id", authenticateJWT, controller.update);

        // GET localhost:3000/usuario/profile
        router.get("/profile", authenticateJWT, controller.userAuth);

        //GET localhost:3000/usuario/3
        router.get('/:id', authenticateJWT, controller.getById);
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
