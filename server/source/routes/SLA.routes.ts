import { Router } from 'express'
import { SLAController } from '../controllers/SLAController'
import { authenticateJWT } from '../middleware/authMiddleware';

export class SLARoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new SLAController()

        //GET localhost:3000/categoria/
        router.get("/", authenticateJWT,controller.get);

        //GET localhost:3000/categoria/3
        router.get('/:id', authenticateJWT, controller.getById);

        return router
    }
}