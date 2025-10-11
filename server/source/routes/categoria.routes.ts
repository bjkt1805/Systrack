import { Router } from 'express'
import { CategoriaController } from '../controllers/categoriaController'

export class CategoriaRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new CategoriaController()

        //GET localhost:3000/categoria/
        router.get('/', controller.get)

        //GET localhost:3000/categoria/search?clave=valor
        router.get('/search',controller.search)
        
        //GET localhost:3000/categoria/3
        router.get('/:id',controller.getById) 

        return router
    }
}