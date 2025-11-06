import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import uploadFile from "../middleware/ImageConfig";

const __basedir = path.resolve();
const baseUrl = "http://localhost:3000/";
const directoryPath = path.join(__basedir, "/assets/uploads/");

// Lista/Array con lista de imágenes que se no se pueden eliminar de assets/uploads
const PROTECTED_FILES = [
  "image-not-found.jpg",
  "default-avatar.jpg",
  "placeholder.jpg"
];

export class ImageController {

  // Método de Express para subir una imagen de forma asíncrona
  upload = async (request: Request, response: Response, next: NextFunction) => {
    
    try {

      //Subir la imagen
      await uploadFile(request, response);

      // Si no existe un archivo en la solicitud, enviar un error 400 y no hacer nada. 
      if (!request.file) {
        response.status(400).send({ message: "¡Por favor suba un archivo!" });
        return;
      }
      // Archivo anterior
      let previousFileName = request.body.previousFileName;

      // Debuggear el Nuevo archivo a subir y el archivo anterior
      console.log("[IMAGE CONTROLLER] Nuevo archivo a subir:", request.file.filename);
      console.log("[IMAGE CONTROLLER] Archivo anterior recibido:", previousFileName);

      // Si existe un archivo anterior, eliminarlo (solo si existe, no está vacío y no está en la lista protegida ej: "image-not-found.jpg", etc.)
      if (previousFileName && !PROTECTED_FILES.includes(previousFileName)) {

        // Obtener la ruta completa del archivo anterior (combina el directorio y el nombre del archivo)
        const previousFilePath = path.join(directoryPath, previousFileName);

        // Verificar si el archivo existe antes de intentar eliminarlo
        if (fs.existsSync(previousFilePath)) {

          // Eliminar el archivo anterior del sistema de archivos
          fs.unlinkSync(previousFilePath);
          console.log(`[IMAGE CONTROLLER] Archivo eliminado: ${previousFilePath}`);
        }
      }

      // Responder con éxito y el nombre del archivo subido
      response.status(200).send({
        message: "Archivo subido exitosamente",
        fileName: request.file.filename,
      });
    } catch (error: any) {
      next(error);
    }
  };


  // Método de Express para listar los archivos subidos
  getListFiles = (
    request: Request,
    response: Response,
    next: NextFunction
  ): void => {

    // Leer el contenido del directorio de subidas (server/assets/uploads)
    try {
      fs.readdir(directoryPath, (err, files) => {

        // Si existe un error al leer el directorio, enviar un error 500 y
        // no hacer nada.
        if (err) {
          response.status(500).send({
            message: "¡No se pueden escanear los archivos!",
          });
          return;
        }

        // Mapear los nombres de archivo a objetos con nombre y URL completa
        const fileInfos = files.map((file) => ({
          name: file,
          url: baseUrl + file,
        }));

        // Enviar la lista de archivos como respuesta
        response.status(200).send(fileInfos);
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Método para descargar un archivo por nombre
  download = (
    request: Request,
    response: Response,
    next: NextFunction
  ): void => {

    // Obtener el nombre del archivo desde los parámetros de la solicitud
    try {
      const fileName = request.params.name;
      const directoryPath = path.join(__basedir, "/assets/uploads//");

      // Usar el método download de Express para enviar el archivo al cliente
      response.download(path.join(directoryPath, fileName), fileName, (err) => {
        if (err) {
          response.status(500).send({
            message: "No se pudo descargar el archivo. " + err,
          });
        }
      });
    } catch (error: any) {
      next(error);
    }
  };
}
