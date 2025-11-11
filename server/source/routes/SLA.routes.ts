import { Router } from 'express'
import { SLAController } from '../controllers/slaController'

export class SLARoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new SLAController()

        //GET localhost:3000/categoria/
        router.get("/", controller.get);

        //GET localhost:3000/categoria/3
        router.get('/:id', controller.getById);

        return router
    }
}