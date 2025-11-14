import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY!,
};

// LocalStrategy: para login con usuario y contraseña
passport.use(
  new LocalStrategy(
    {
      usernameField: "correo",
      passwordField: "contrasenaHash", // REVISAR SI HAY QUE CAMBIAR EL CAMPO A "contrasena"
    },
    async (correo, password, done) => {
      try {
        const user = await prisma.usuario.findUnique({ where: { correo } });
        if (!user)
          return done(null, false, { message: "Usuario no registrado" });

        const isMatch = await bcrypt.compare(password, user.contrasenaHash);
        if (!isMatch)
          return done(null, false, { message: "Contraseña incorrecta" });

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
      const user = await prisma.usuario.findUnique({
        where: { id: payload.id },
      });
      if (user) return done(null, user);
      else return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
