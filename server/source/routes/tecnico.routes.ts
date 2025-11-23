import { Router } from 'express'
import { TecnicoController } from '../controllers/tecnicoController'

export class TecnicoRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new TecnicoController()

        //GET localhost:3000/tecnico/ - Listado de todos los técnicos
        router.get('/', controller.get)

        // GET localhost:3000/tecnico/available - Listado de técnicos disponibles
        router.get('/available', controller.getAvailable)

        //GET localhost:3000/tecnico/search?clave=valor - Buscar técnicos con filtros y paginación
        router.get('/search',controller.search)
        
        //GET localhost:3000/tecnico/3 - Obtener un técnico por su ID
        router.get('/:id',controller.getById) 

        // POST localhost:3000/tecnico/ - Crear un técnico
        router.post('/',controller.create)

        // PUT localhost:3000/tecnico/3 - Actualizar un técnico por su ID
        router.put('/:id',controller.update)

        return router
    }
}