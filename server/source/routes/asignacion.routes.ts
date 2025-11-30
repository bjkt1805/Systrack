import { Router } from 'express'
import { AsignacionController } from '../controllers/asignacionController'
import { authenticateJWT } from '../middleware/authMiddleware'

export class AsignacionRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new AsignacionController()

        // POST localhost:3000/asignacion/auto-asignar/:id - Asignar un ticket automáticamente
        router.post('/auto-asignar/:id', controller.autoAsignarTicket)


        // POST localhost:3000/ticket/3/asignar-manual - Asignar un ticket manualmente
        router.post('/:id/asignar-manual', authenticateJWT, controller.asignarManual);

        return router; 
    }
}