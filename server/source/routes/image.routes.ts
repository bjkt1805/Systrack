import { Router } from 'express'
import { ImageController } from '../controllers/imageController'
import { authenticateJWT } from '../middleware/authMiddleware';


export class ImageRoutes {
    static get routes(): Router {
        const router= Router()
        const controller=new ImageController()
        
        router.post("/upload", authenticateJWT, controller.upload);
        router.get("/files", authenticateJWT, controller.getListFiles);
        router.get("/files/:name", authenticateJWT, controller.download);
        return router
    }
}