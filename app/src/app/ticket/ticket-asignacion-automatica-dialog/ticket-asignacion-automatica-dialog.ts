import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Interfaz para agrupar los datos a mostrar en el dialog
interface AsignacionResultadoDatos {
    success: boolean; 
    ticketCodigo: string; 
    tecnicoAsignado: {
        nombreCompleto: string; 
        correo: string; 
        especialidades: string [];
    };
    reglaAplicada: {
        nombre: string; 
    }; 
    calculosRealizados: {
        prioridad: number; 
        slaRestanteEnHoras: number; 
        puntajeTotalTecnico: number; 
        formulaUtilizada: string; 
    };
    justificacion: string; 
}

    @Component({
        selector: 'app-ticket-asignacion-automatica-dialog',
        standalone: false,
        templateUrl: './ticket-asignacion-automatica-dialog.html',
        styleUrl: './ticket-asignacion-automatica-dialog.css'
    })

    export class AsignacionAutomaticaDialog {

        constructor (
            public dialogRef: MatDialogRef<AsignacionAutomaticaDialog>,
            @Inject(MAT_DIALOG_DATA) public data: AsignacionResultadoDatos
        ) {
            // Deshabilitar cierre con ESC o clic fuera del dialog
            dialogRef.disableClose = true;
        }

        /**
         * Cerrar el dialog
         */
        onClose(): void{
            this.dialogRef.close();
        }

        /**
         * Obtener el color según el puntaje
         */
        getPuntajeColor(puntaje: number): string {
            if (puntaje >= 3000) { return 'green'; } // Verde para puntajes altos
            if (puntaje >= 2000) { return 'orange'; } // Naranja para puntajes medios
            return 'red'; // Rojo para puntajes bajos
        }

        /** 
         * Darle formato al mensaje de justificación (incluyendo saltos de línea)
         */
        formatearJust (texto: string): string {
            return texto.split('\n').filter(line => line.trim() !== '').join('\n');
        }

    }
