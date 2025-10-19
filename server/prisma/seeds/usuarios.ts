import { EstadoTecnico, Prisma, Rol } from "../../generated/prisma";
import { especialidades } from "./especialidades";

export const usuarios = [
  // -- ADMIN --
  {
    nombreUsuario: "Brian Kellerman",
    correo: "brian-admin1@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.ADMIN,
  },
  {
    nombreUsuario: "Warner Salazar",
    correo: "warner-admin2@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.ADMIN,
  },

  // -- TÉCNICOS --
  {
    nombreUsuario: "Andrés González",
    correo: "andres-tecnico1@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.DISPONIBLE,
    cargaTrabajo: 0,
  },
  {
    nombreUsuario: "Pedro Carrillo",
    correo: "pedro-tecnico2@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.NO_DISPONIBLE,
    cargaTrabajo: 0,
  },
    {
    nombreUsuario: "Andrea López",
    correo: "andrea-tecnico3@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.DISPONIBLE,
    cargaTrabajo: 0,
  },
  {
    nombreUsuario: "Juan Martínez",
    correo: "juan-tecnico4@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.NO_DISPONIBLE,
    cargaTrabajo: 0,
  },
    {
    nombreUsuario: "Felipe Ramírez",
    correo: "felipe-tecnico5@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.DISPONIBLE,
    cargaTrabajo: 0,
  },
  {
    nombreUsuario: "Alberto Sánchez",
    correo: "alberto-tecnico6@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.NO_DISPONIBLE,
    cargaTrabajo: 0,
  },

  // -- CLIENTES -- (si no se pone `rol`, toma el default CLIENTE)
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
