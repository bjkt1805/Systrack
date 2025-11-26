import { Router } from 'express'
import { AsignacionController } from '../controllers/asignacionController'

export class AsignacionRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new AsignacionController()

        // POST localhost:3000/asignacion/auto-asignar/:id - Asignar un ticket automáticamente
        router.post('/auto-asignar/:id', controller.autoAsignarTicket)

        return router; 
    }
}