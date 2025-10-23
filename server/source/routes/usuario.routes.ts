import { Router } from 'express'
import { UsuarioController } from '../controllers/usuarioController'

export class UsuarioRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new UsuarioController()

        //GET localhost:3000/usuario/
        router.get('/', controller.get)

        //GET localhost:3000/tecnico/search?clave=valor
        // router.get('/search',controller.search)
        
        //GET localhost:3000/tecnico/3
        // router.get('/:id',controller.getById) 

        return router
    }
}