import { Router } from 'express'
import { TicketController } from '../controllers/ticketController'
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import uploadTicketImages from '../middleware/ticketImageConfig';
import { Rol } from '../../generated/prisma';

export class TicketRoutes {

    // Definición de las rutas
    static get routes(): Router {
        const router = Router()
        const controller = new TicketController()

        //GET localhost:3000/ticket/
        router.get('/', authenticateJWT, controller.get)

        //GET localhost:3000/ticket/kanban?semana=2025-10-27
        router.get('/kanban', authenticateJWT, authorizeRoles (Rol.ADMIN, Rol.TECNICO), controller.getKanban);

        //GET localhost:3000/ticket/usuario/:id
        router.get('/usuario/:id', authenticateJWT,controller.getTicketsByUsuario);

        //GET localhost:3000/ticket/search?clave=valor -- Eje: http://localhost:3000/ticket/search?termino=laptop&userId=1&userRol=ADMINISTRADOR
        // router.get('/search',controller.search)
        
        //GET localhost:3000/ticket/3
        router.get('/:id', authenticateJWT, controller.getById)

        // POST localhost:3000/ticket/ - Crear un ticket (incluyendo imágenes)
        router.post('/', uploadTicketImages, controller.create)

        // PUT localhost:3000/ticket/3/state - Actualizar el estado de un ticket por su ID (incluyendo imágenes)
        router.put('/:id/estado', authenticateJWT, controller.updateEstado);


        // PUT localhost:3000/ticket/3 - Actualizar un ticket por su ID (incluyendo imágenes)
        router.put('/:id', uploadTicketImages, authenticateJWT, controller.update);
        return router;

        // Estructura a seguir para rutas protegidas con JWT y con rol de Administrador 
        // router.get(
        //     'ruta',
        //     authenticateJWT,
        //     authorizeRoles(Rol.ADMIN),
        //     controller.accion
        // );
    }
}