// Importar las dependencias necesarias (jsonwebtoken y tipos de Rol)

import { sign, Secret, SignOptions } from "jsonwebtoken";
import { Rol } from "../../generated/prisma";

// Función para generar un token JWT basado en el id, correo y rol del usuario
export function generateToken(user: {
  id: number;
  correo: string;
  rol: Rol;
}): string {

  // Obtener la clave secreta desde las variables de entorno
  const secretKey = process.env.SECRET_KEY; 

  // Verificar que la clave secreta esté definida, si no, lanzar un error
  if (!secretKey) {
    throw new Error("SECRET_KEY no esta definido en la variables de entorno");
  }

  // Configurar el jwtSecret 
  const jwtSecret: Secret = secretKey;

  // Configurar las opciones del token JWT (expiración del token en una hora)
  const jwtOptions: SignOptions = {
    expiresIn: "1h",
  };

  // Crear el payload del token con la información del usuario (id, correo y rol)
  const payload = {
    id: user.id,
    correo: user.correo,
    rol: user.rol,
  };

  // Firmar y retornar el token JWT (utilizando el payload, jwtSecret y jwtOptions)
  try {
    return sign(payload, jwtSecret, jwtOptions);
  } catch (error) {
    console.error("Error creando JWT:", error);
    throw new Error("Fallo al genera JWT.");
  }
}
