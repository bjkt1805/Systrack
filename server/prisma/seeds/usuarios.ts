import { EstadoTecnico, Prisma, Rol } from "../../generated/prisma";

export const usuarios = [
  // -- ADMIN --
  {
    nombreUsuario: "brianKellerman2025",
    correo: "brian-admin1@prueba.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.ADMIN,
  },
  {
    nombreUsuario: "warnerSalazar2025",
    correo: "warner-admin2@prueba.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.ADMIN,
  },

  // -- TÉCNICOS --
  {
    nombreUsuario: "tecnico1",
    correo: "usuario-tecnico1@prueba.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.ADMIN,
    estadoTecnico: EstadoTecnico.DISPONIBLE,
    cargaTrabajo: 0,
  },
  {
    nombreUsuario: "tecnico2",
    correo: "usuario-tecnico2@prueba.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.NO_DISPONIBLE,
    cargaTrabajo: 0,
  },

  // -- CLIENTES -- (si no pones `rol`, toma el default CLIENTE)
  {
    nombreUsuario: "cliente1",
    correo: "cliente1@prueba.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },
  {
    nombreUsuario: "cliente2",
    correo: "cliente2@prueba.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },
];
