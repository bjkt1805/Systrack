import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

// Configuración de las opciones para la estrategia JWT 
// (extracción del token en el encabezado de autorización y clave secreta)
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY!,
};

// LocalStrategy: para login con usuario y contraseña
passport.use(

  // Configuración de la estrategia local con los campos "correo" y "contrasenaHash"
  new LocalStrategy(
    {
      usernameField: "correo",
      passwordField: "contrasenaHash", // REVISAR SI HAY QUE CAMBIAR EL CAMPO A "contrasena"
    },

    // Función para autenticar al usuario con correo y contraseña
    async (correo, password, done) => {
      try {

        // Buscar el usuario en la base de datos por correo
        const user = await prisma.usuario.findUnique({ where: { correo } });

        // Si no existe el usuario, retornar false con mensaje de error "Usuario no registrado"
        if (!user)
          return done(null, false, { message: "Usuario no registrado" });

        // Comparar la contraseña proporcionada con el hash almacenado en la base de datos
        const isMatch = await bcrypt.compare(password, user.contrasenaHash);

        // Si no existe coincidencia, retornar false con mensaje de error "Contraseña incorrecta"
        if (!isMatch)
          return done(null, false, { message: "Contraseña incorrecta" });

        // Si todo es correcto, retornar el usuario autenticado
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JwtStrategy: para proteger rutas con token JWT
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {

      // Buscar el usuario en la base de datos por id del payload
      const user = await prisma.usuario.findUnique({
        where: { id: payload.id },
      });

      // Si se encuentra el usuario, retornarlo; si no, retornar false
      if (user) return done(null, user);
      else return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
