import { Router } from 'express'
import { TecnicoController } from '../controllers/tecnicoController'
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware'
import { Rol } from '../../generated/prisma'

export class TecnicoRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new TecnicoController()

        //GET localhost:3000/tecnico/ - Listado de todos los técnicos
        router.get('/', authenticateJWT, authorizeRoles(Rol.ADMIN), controller.get)

        // GET localhost:3000/tecnico/available - Listado de técnicos disponibles
        router.get('/available', authenticateJWT, controller.getAvailable)

        //GET localhost:3000/tecnico/search?clave=valor - Buscar técnicos con filtros y paginación
        // router.get('/search',controller.search)
        
        //GET localhost:3000/tecnico/3 - Obtener un técnico por su ID
        router.get('/:id',authenticateJWT, authorizeRoles(Rol.ADMIN), controller.getById) 

        // POST localhost:3000/tecnico/ - Crear un técnico
        router.post('/', authenticateJWT, authorizeRoles(Rol.ADMIN), controller.create)

        // PUT localhost:3000/tecnico/3 - Actualizar un técnico por su ID
        router.put('/:id', authenticateJWT, authorizeRoles(Rol.ADMIN), controller.update)

        return router
    }
}