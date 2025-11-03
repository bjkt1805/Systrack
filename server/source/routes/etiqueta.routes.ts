import { Router } from 'express';
import { EtiquetaController } from '../controllers/etiquetaController';

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
        router.get('/', controller.get);
        
        // Obtener categorías por etiqueta
        router.get('/:id/categorias', controller.getCategoriasByEtiquetaId);
        return router
    }
}