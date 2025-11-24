import { Prioridad } from "../../generated/prisma";
export const regla = [

    // Regla 1 - Hardware Urgente (Mantenimiento)
    {
        nombre: "Regla 1 - Hardware Urgente (Mantenimiento)",
        activa: true,

        categoriaId: 1, // Hardware
        especialidadId: 3, // Mantenimiento preventivo y correctivo

        prioridad: Prioridad.URGENTE,

        aplicaATodasPrioridades: false,
        pesoCargaTrabajo: 2, // Solo tecnicos con menos de 2 tiquetes asignados
        ordenPrioridad: 1 // Prioridad alta
    },

    // Regla 2 - Redes y Conectividad Alta (Ciberseguridad)
    {
        nombre: "Regla 2 - Redes y Conectividad Alta (Ciberseguridad)",
        activa: true,

        categoriaId: 2, // Redes y Conectividad
        especialidadId: 6, // Especialista en ciberseguridad

        prioridad: Prioridad.ALTA,

        aplicaATodasPrioridades: false,
        pesoCargaTrabajo: 3, // Solo tecnicos con menos de 3 tiquetes asignados
        ordenPrioridad: 2 // Prioridad media
    }, 

    // Regla 3 - Soporte a Usuario Final Media (Administrador de sistemas)
    {
        nombre: "Regla 3 - Soporte a Usuario Final Media (Administrador de sistemas)",
        activa: true,

        categoriaId: 3, // Soporte a Usuario Final
        especialidadId: 7, // Administrador de sistemas

        prioridad: Prioridad.MEDIA,

        aplicaATodasPrioridades: false,
        pesoCargaTrabajo: 4, // Solo tecnicos con menos de 4 tiquetes asignados
        ordenPrioridad: 3 // Prioridad baja
    },

    // Regla 4 - Aplicaciones y Sistemas Internos Baja (Desarrollador de software)
    {
        nombre: "Regla 4 - Aplicaciones y Sistemas Internos Baja (Desarrollador de software)",
        activa: true,

        categoriaId: 4, // Aplicaciones y Sistemas Internos
        especialidadId: 9, // Desarrollador de software

        prioridad: Prioridad.BAJA,

        aplicaATodasPrioridades: false, // Aplica a todas las prioridades
        pesoCargaTrabajo: 5, // Solo tecnicos con menos de 5 tiquetes asignados
        ordenPrioridad: 4 // Prioridad baja
    }, 

    // Regla 5 - Soporte a Usuario Final Todas Prioridades (Soporte en infraestructura)
    {
        nombre: "Regla 5 - Soporte a Usuario Final Todas Prioridades (Soporte en infraestructura)",
        activa: true,

        categoriaId: 3, // Soporte a Usuario Final
        especialidadId: 5, // Soporte en infraestructura

        prioridad: null, // Aplica a todas las prioridades

        aplicaATodasPrioridades: true,
        pesoCargaTrabajo: 6, // Solo tecnicos con menos de 6 tiquetes asignados
        ordenPrioridad: 5 // Prioridad baja
    },

    // Regla 6 - Hardware Todas Prioridades (Técnico en reparación de equipos electrónicos)
    {
        nombre: "Regla 6 - Hardware Todas Prioridades (Técnico en reparación de equipos electrónicos)",
        activa: true,

        categoriaId: 1, // Hardware
        especialidadId: 1, // Técnico en reparación de equipos electrónicos

        prioridad: null, // Aplica a todas las prioridades
        
        aplicaATodasPrioridades: true,
        pesoCargaTrabajo: 4, // Solo tecnicos con menos de 4 tiquetes asignados
        ordenPrioridad: 6 // Prioridad media
    },
]