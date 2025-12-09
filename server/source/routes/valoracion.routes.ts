import { Router } from 'express'
import { ValoracionController } from '../controllers/ValoracionController'
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware'
import { Rol } from '../../generated/prisma'

export class ValoracionRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new ValoracionController()

        // GET /api/valoracion - Obtener todas las valoraciones
        router.get('/', authenticateJWT, controller.get);

        // POST /api/valoracion - Crear una valoración (solo CLIENTE)
        router.post('/', authenticateJWT, authorizeRoles(Rol.CLIENTE), controller.create);

        // GET /api/valoracion/promedio/tecnico/:tecnicoId - Promedio de un técnico
        router.get('/promedio/tecnico/:tecnicoId', authenticateJWT, controller.getPromedioByTecnico);

        return router
    }
}