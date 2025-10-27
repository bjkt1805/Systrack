import { EstadoTecnico, Prisma, Rol } from "../../generated/prisma";
import { especialidades } from "./especialidades";

export const usuarios = [
  // -- ADMIN --

  // id: 1
  {
    nombreUsuario: "bkellerman",
    nombreCompleto: "Brian Kellerman",
    telefono: "+506 7296 9719",
    correo: "brian-admin1@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.ADMIN,
  },

  // id: 2
  {
    nombreUsuario: "warner.salazar",
    nombreCompleto: "Warner Salazar",
    telefono: "+506 8603 3576",
    correo: "warner-admin2@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.ADMIN,
  },

  // -- TÉCNICOS --

  // id: 3
  {
    nombreUsuario: "andres.gonzalez",
    nombreCompleto: "Andrés González",
    telefono: "+506 8485 9721",
    correo: "andres-tecnico1@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.DISPONIBLE,
    cargaTrabajo: 0,
    foto: "tecnico1.jpg",
  },

  // id: 4
  {
    nombreUsuario: "pedro.carrillo",
    nombreCompleto: "Pedro Carrillo",
    telefono: "+506 6592 4486",
    correo: "pedro-tecnico2@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.DISPONIBLE,
    cargaTrabajo: 1,
  },

  // id: 5
  {
    nombreUsuario: "andrea.lopez",
    nombreCompleto: "Andrea López",
    telefono: "+506 8762 9695",
    correo: "andrea-tecnico3@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.DISPONIBLE,
    cargaTrabajo: 1,
  },

  // id: 6
  {
    nombreUsuario: "juan.martinez",
    nombreCompleto: "Juan Martínez",
    telefono: "+506 8006 7632",
    correo: "juan-tecnico4@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.DISPONIBLE,
    cargaTrabajo: 0,
  },

  // id: 7
  {
    nombreUsuario: "felipe.ramirez",
    nombreCompleto: "Felipe Ramírez",
    telefono: "+506 7423 9687",
    correo: "felipe-tecnico5@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.NO_DISPONIBLE,
    cargaTrabajo: 0,
  },

  // id: 8
  {
    nombreUsuario: "alberto.sanchez",
    nombreCompleto: "Alberto Sánchez",
    telefono: "+506 7745 5315",
    correo: "alberto-tecnico6@systrack.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    rol: Rol.TECNICO,
    estadoTecnico: EstadoTecnico.NO_DISPONIBLE,
    cargaTrabajo: 0,
  },

  // -- CLIENTES -- (si no se pone `rol`, toma el default CLIENTE)

  // id: 9
  {
    nombreUsuario: "maria.gonzalez",
    nombreCompleto: "María González",
    telefono: "+506 6998 1234",
    correo: "mgonzalez@gmail.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 10
  {
    nombreUsuario: "andres.mora",
    nombreCompleto: "Andrés Mora",
    telefono: "+506 8881 4422",
    correo: "andresmora@gmail.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 11
  {
    nombreUsuario: "carolina.vega",
    nombreCompleto: "Carolina Vega",
    telefono: "+506 7112 5589",
    correo: "carolinavega@outlook.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 12
  {
    nombreUsuario: "diego.rojas",
    nombreCompleto: "Diego Rojas",
    telefono: "+506 6023 9874",
    correo: "diegorojas@hotmail.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 13
  {
    nombreUsuario: "sofia.castro",
    nombreCompleto: "Sofía Castro",
    telefono: "+506 7011 3322",
    correo: "sofia.castro@gmail.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 14
  {
    nombreUsuario: "ricardo.solis",
    nombreCompleto: "Ricardo Solís",
    telefono: "+506 8299 4455",
    correo: "rsolis@icloud.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 15
  {
    nombreUsuario: "laura.martinez",
    nombreCompleto: "Laura Martínez",
    telefono: "+506 6134 7788",
    correo: "laura.martinez@yahoo.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 16
  {
    nombreUsuario: "felipe.araya",
    nombreCompleto: "Felipe Araya",
    telefono: "+506 8876 0044",
    correo: "felipe.araya@correo.cr",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 17
  {
    nombreUsuario: "paola.salas",
    nombreCompleto: "Paola Salas",
    telefono: "+506 7044 6622",
    correo: "paola.salas@gmail.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 18
  {
    nombreUsuario: "esteban.lopez",
    nombreCompleto: "Esteban López",
    telefono: "+506 7155 2299",
    correo: "estebanlopez@outlook.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  },

  // id: 19
  {
    nombreUsuario: "valeria.chacon",
    nombreCompleto: "Valeria Chacón",
    telefono: "+506 6099 8877",
    correo: "valeria.chacon@gmail.com",
    contrasenaHash: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
  }
];
