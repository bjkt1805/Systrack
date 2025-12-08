import { Router } from 'express'
import { CategoriaController } from '../controllers/categoriaController'
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware'
import { Rol } from '../../generated/prisma'

export class CategoriaRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new CategoriaController()

        //GET localhost:3000/categoria/
        router.get('/', authenticateJWT, controller.get)

        //GET localhost:3000/categoria/search?clave=valor
        // router.get('/search', authenticateJWT, controller.search)
        
        //GET localhost:3000/categoria/3
        router.get('/:id', authenticateJWT, controller.getById) 

        // POST localhost:3000/categoria/ - Crear una categoría
        router.post('/', authenticateJWT, authorizeRoles(Rol.ADMIN), controller.create)

        // PUT localhost:3000/categoria/3 - Actualizar una categoría por su ID
        router.put('/:id', authenticateJWT, authorizeRoles(Rol.ADMIN), controller.update)
        
        return router
    }
}