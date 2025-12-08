import { Router } from 'express'
import { NotificacionController } from '../controllers/notificacionController';
import { authenticateJWT } from '../middleware/authMiddleware';

export class NotificacionRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new NotificacionController()

        //GET localhost:3000/notificacion/{usuarioId}
        router.get('/:id', authenticateJWT, controller.get);

        // GET localhost:3000/notificacion/usuario/{usuarioId}
        router.get('/usuario/:id', authenticateJWT, controller.getByUsuario);

        //POST localhost:3000/notificacion/marcar-como-leida/{notificacionId}
        router.put('/marcar-leida/:id', authenticateJWT, controller.actualizarNotificacion);

        return router
    }
}