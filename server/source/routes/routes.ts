import { Router } from 'express';
import { TecnicoRoutes } from './tecnico.routes';
import { CategoriaRoutes } from './categoria.routes';
import { TicketRoutes } from './ticket.routes';
import { UsuarioRoutes } from './usuario.routes';

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        // ----Agregar las rutas---- 
        router.use('/usuario',UsuarioRoutes.routes)
        router.use('/tecnico',TecnicoRoutes.routes)
        router.use('/categoria',CategoriaRoutes.routes)
        router.use('/ticket',TicketRoutes.routes)
        return router;
    }
}