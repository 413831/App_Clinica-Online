import { Component, OnInit } from '@angular/core';
import { Medico } from 'src/app/clases/Medico';
import { Turno } from 'src/app/clases/Turno';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogExtrasComponent } from '../dialog-extras/dialog-extras.component';
import { Historia } from 'src/app/clases/Historia';
import { DialogDatoComponent } from '../dialog-dato/dialog-dato.component';
import { ServicioHistoriasService } from 'src/app/servicios/servicio-historias.service';
import { TurnosService } from 'src/app/servicios/servicio-turnos.service';

export interface Dato{
  key: string,
  value: any
}

@Component({
  selector: 'app-alta-historia',
  templateUrl: './alta-historia.component.html',
  styleUrls: ['./alta-historia.component.css']
})
export class AltaHistoriaComponent implements OnInit {
  medico: Medico;
  turno: Turno;
  historia: Historia; 
  edad: number;
  peso: number;
  altura: number;
  sexos: string[] = ["Masculino", "Femenino", "Otro"];
  datosExtras: boolean = false;
  extras:Array<Dato> = new Array<Dato>();

  constructor(public nuevoAtributo: MatDialog, public detalleDato: MatDialog,
              private servicioHistoria: ServicioHistoriasService, private servicioTurnos: TurnosService) 
  {
    this.medico = Object.assign(new Medico, 
      JSON.parse(localStorage.getItem('usuario-logueado')));  
    this.turno = Object.assign(new Turno, 
        JSON.parse(localStorage.getItem('turno-terminado')));
    // Recuperar historia existente con id del paciente sino crear nueva
    this.historia = new Historia(); 
  }

  ngOnInit(): void {
    this.historia.paciente = this.turno.nombrePaciente;
  }

  agregarInfo()
  {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.extras;
    dialogConfig.width = '260px';
    dialogConfig.height = '220px';
    dialogConfig.panelClass = "dialog";
    const dialogRef = this.nuevoAtributo.open(DialogExtrasComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => 
    {
      if(result)
      {  
        this.extras = result;
        console.log('Datos agregados.');
        
        this.datosExtras = true;
      }
    });

  }

  seleccionar(dato: Dato)
  {
    console.log(dato);
    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = dato;
    dialogConfig.width = '350px';
    dialogConfig.height = '250px';
    dialogConfig.panelClass = 'dialog';
    const dialogRef = this.nuevoAtributo.open(DialogDatoComponent, dialogConfig);

    dialogRef.afterClosed().subscribe( result =>{
      if(!result)
      {
        console.log("Dato borrado");
      }
    })
  }

  guardarHistoria()
  {
    // Se agregan los datos extras al objeto Turno
    this.extras.forEach( dato => Turno.AgregarDato(this.turno, dato.key, dato.value));

    console.log(Object.entries(this.turno));

    this.historia.consultas.push(this.turno);
    this.historia.adicionales = this.extras.map( dato => dato.key);
    console.log(this.historia);
    this.servicioTurnos.actualizar(this.turno);
    this.servicioHistoria.crear(this.historia);
    
  }

}
