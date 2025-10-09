import { Router } from 'express';
import { UsuarioRoutes } from './usuario.routes';

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        // ----Agregar las rutas---- 
        router.use('/usuario',UsuarioRoutes.routes)
        return router;
    }
}