import { Router } from 'express'
import { TicketController } from '../controllers/ticketController'

export class TicketRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new TicketController()

        //GET localhost:3000/ticket/
        router.get('/', controller.get)

        //GET localhost:3000/ticket/usuario/:id
        router.get('/usuario/:id', controller.getTicketsByUsuario);

        //GET localhost:3000/ticket/search?clave=valor -- Eje: http://localhost:3000/ticket/search?termino=laptop&userId=1&userRol=ADMINISTRADOR
        // router.get('/search',controller.search)
        
        //GET localhost:3000/ticket/3
        router.get('/:id',controller.getById) 

        return router
    }
}