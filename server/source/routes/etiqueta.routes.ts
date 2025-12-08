import { Router } from 'express';
import { EtiquetaController } from '../controllers/etiquetaController';
import { authenticateJWT } from '../middleware/authMiddleware';

export class EtiquetaRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new EtiquetaController()

        // Rutas básicas
        // router.get('/search', etiquetaController.search);
        // router.get('/:id', etiquetaController.getById);
        // router.post('/', etiquetaController.create);
        // router.put('/:id', etiquetaController.update);
        // router.delete('/:id', etiquetaController.delete);

        // Obtener todas las etiquetas
        router.get('/', authenticateJWT,controller.get);
        
        // Obtener categorías por etiqueta
        router.get('/:id/categorias', authenticateJWT, controller.getCategoriasByEtiquetaId);
        return router
    }
}