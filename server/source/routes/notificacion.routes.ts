import { Router } from 'express'
import { NotificacionController } from '../controllers/notificacionController';

export class NotificacionRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new NotificacionController()

        //GET localhost:3000/notificacion/{usuarioId}
        router.get('/:id', controller.get);

        return router
    }
}