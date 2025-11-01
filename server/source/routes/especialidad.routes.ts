import { Router } from 'express'
import { EspecialidadController } from '../controllers/especialidadController'

export class EspecialidadRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new EspecialidadController()

        //GET localhost:3000/especialidad/
        router.get('/', controller.get)

        return router
    }
}