import { Router } from 'express'
import { EspecialidadController } from '../controllers/especialidadController'
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware'
import { Rol } from '../../generated/prisma'

export class EspecialidadRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new EspecialidadController()

        //GET localhost:3000/especialidad/
        router.get('/', authenticateJWT, authorizeRoles(Rol.ADMIN), controller.get)

        return router
    }
}