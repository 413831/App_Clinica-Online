import { Component, OnInit, Inject } from '@angular/core';
import { Turno } from 'src/app/clases/Turno';
import { Usuario, Rol } from 'src/app/clases/Usuario';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Medico } from 'src/app/clases/Medico';
import { Paciente } from 'src/app/clases/Paciente';
import { Administrador } from 'src/app/clases/Administrador';
import { DialogComponent } from 'src/app/componentes/dialog/dialog.component';
import { ModificarMedicoComponent } from 'src/app/componentes/modificar-medico/modificar-medico.component';
import { ModificarPacienteComponent } from 'src/app/componentes/modificar-paciente/modificar-paciente.component';
import { MedicosService } from 'src/app/servicios/servicio-medicos.service';
import { PacientesService } from 'src/app/servicios/servicio-pacientes.service';
import { AdministradoresService } from 'src/app/servicios/servicio-administradores.service';
import { MiservicioService } from 'src/app/servicios/miservicio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ListadoMedicosComponent } from 'src/app/componentes/listado-medicos/listado-medicos.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AutorizadoSnackbarComponent } from 'src/app/componentes/autorizado-snackbar/autorizado-snackbar.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {  
  durationInSeconds = 5;
  public dataMedicos;
  public dataPacientes;
  public dataTurnos;
  public turnosModificados: Turno[];
  columnasMedicos: string[] = ['nombre', 'matricula'];
  columnasPacientes: string[] = ['nombre', 'afiliado'];
  columnasTurnos: string[] = ['especialidad', 'estado' ,'fecha'];
  public confirmacion: boolean = false;
  public usuario: any;
  public medico: Medico | null;
  public medicoAutorizar: Medico;
  public paciente: Paciente | null;
  public administrador: Administrador | null;
  public turno: Turno | null;
  public rol: Rol;
  public imgPerfil: string;
  public imgAvatar: string;
  public turnos: Turno[];
  public listadoMedicos: Medico[];
  public listadoPacientes: Paciente[];
  public mostrarPacientes: boolean = false;
  public mostrarMedicos: boolean = true;

  constructor(public modificarDialog: MatDialog, public borrarDialog: MatDialog,
              private _snackBar: MatSnackBar,
              public altaTurno: MatDialog,
              public medicosService: MedicosService,
              public pacienteService: PacientesService,
              public adminService: AdministradoresService,              
              public route: ActivatedRoute, public router: Router) 
  { 
    this.usuario = JSON.parse(localStorage.getItem('usuario-logueado'));

    if(this.usuario)
    {
      this.obtenerPerfil();
      this.obtenerTurnos();
      this.turnosModificados = this.turnos.filter(turno => turno.modificado == true);
      console.log(this.turnosModificados);

    }
  }

  ngOnInit(): void 
  {
  }

  obtenerPerfil()
  {

    switch(this.usuario.rol)
    {
      case Rol.Administrador:
        this.administrador = <Administrador>this.usuario;
        this.listadoMedicos = JSON.parse(localStorage.getItem('medicos'))
                                  .filter( medico => !medico.autorizado );
        this.dataMedicos = new MatTableDataSource(this.listadoMedicos);
        this.dataMedicos = new MatTableDataSource(this.listadoMedicos);
        this.listadoPacientes = JSON.parse(localStorage.getItem('pacientes'));
        this.dataPacientes = new MatTableDataSource(this.listadoPacientes);       
        
        break;
      case Rol.Medico:
        this.medico = <Medico>this.usuario;
        
        break;
      case Rol.Paciente:
        this.paciente = <Paciente>this.usuario;
        break;                 
    }

    MiservicioService.descargarImagen(this.usuario.imagen)
                      .then(()=>  this.imgPerfil = MiservicioService.imgSrc);
    MiservicioService.descargarImagen(this.usuario.avatar)
                      .then(()=>  this.imgAvatar = MiservicioService.imgSrc);
  }

  obtenerTurnos()
  {
    switch(this.usuario.rol)
    {     
      case Rol.Medico: 
        this.turnos = JSON.parse(localStorage.getItem('turnos'))
                      .filter( turno => this.medico.nombre == turno.nombreMedico);
        break;
      case Rol.Paciente:
        this.turnos = JSON.parse(localStorage.getItem('turnos'))
                      .filter( turno => this.paciente.nombre == turno.nombrePaciente);
        break;                 
    }
    this.dataTurnos = new MatTableDataSource(this.turnos);
  }

  seleccionarTurno(turno: Turno)
  {
    // Seleccionar turno para modificar
    this.turno = turno;
  }

  cargarTurno()
  {
    // Se muestra listado de medicos para el turno

    let dialogConfig = new MatDialogConfig();
    let dialogRef;
    dialogConfig.data = this.dataMedicos;
    dialogConfig.width = '700px';
    dialogConfig.height = '500px';
    dialogConfig.panelClass = "detalle";

    dialogRef = this.altaTurno.open(ListadoMedicosComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => 
    {
      console.log('Se guardo el turno.');
      console.log(result);
    });
  }

  modificarTurno()
  {
    localStorage.setItem('nuevoTurno',JSON.stringify(this.turno));
    this.router.navigate(["/modificar-turno"]);
  }

  modificar()
  {
    // Modal para modificar todos los datos
    // El modal tiene que tener datos precargados
    let dialogConfig = new MatDialogConfig();
    let dialogRef;
    dialogConfig.data = this.usuario;
    dialogConfig.width = '700px';
    dialogConfig.height = '350px';
    dialogConfig.panelClass = "dialog";

    switch(this.usuario.rol)
    {
      // case Rol.Administrador:
      //   this.administrador = <Administrador>usuario;
      //   break;
      case Rol.Medico:
        dialogRef = this.modificarDialog.open(ModificarMedicoComponent, dialogConfig);
        break;
      case Rol.Paciente:
        dialogRef = this.modificarDialog.open(ModificarPacienteComponent, dialogConfig);
        break; 
    }

    dialogRef.afterClosed().subscribe(result => 
    {
      this._snackBar.openFromComponent(AutorizadoSnackbarComponent, {
      duration: this.durationInSeconds * 1000,
      data: this.medicoAutorizar
      });
    });
  }

  borrar()
  {
    // Modal confirmando la accion
    const dialogRef = this.borrarDialog.open(DialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      // Cerrar sesion y navegar al home
      if(result)
      {
        // Mejorar todo esto y conectar servicio correspondiente segun Rol
        switch(this.usuario.rol)
        {
          case Rol.Administrador:
            this.adminService.borrar(this.administrador.id);
            break;
          case Rol.Medico:
            this.medicosService.borrar(this.medico.id);
            break;
          case Rol.Paciente:
            this.pacienteService.borrar(this.paciente.id);
            break;                   
        }
        console.log('Baja realizada.');
        console.log(result); 
        this.logout();
      }
    });
  }

  logout()
  {
    MiservicioService.cerrarSesion();
    this.router.navigate(["home"]);
  }

  listarPacientes()
  {
    this.mostrarPacientes = true;
    this.mostrarMedicos = false;
  }

  listarMedicos()
  {
    this.mostrarMedicos = true;
    this.mostrarPacientes = false;
  }

  listarTurnos()
  {

  }

  altaAdmin()
  {

  }

  autorizar()
  {
    this.medicoAutorizar.autorizado = true;
    this.medicoAutorizar.consultorio = Math.floor(Math.random() * 6) + 1; 
    //Aca se tiene que mostrar los datos del medico
    //Tambien un boton para cambiar el estado de autorizado
    this.medicosService.actualizar(this.medicoAutorizar);
    this._snackBar.openFromComponent(AutorizadoSnackbarComponent, {
      duration: this.durationInSeconds * 1000,
      data: this.medicoAutorizar
    });
    
  }

  seleccionarMedico(medico: Medico)
  {
    this.medicoAutorizar = medico; 
    console.log(this.medicoAutorizar);
  }

}

export class DialogModificar {

  constructor(public dialogRef: MatDialogRef<DialogModificar>,
              @Inject(MAT_DIALOG_DATA) public data: Usuario) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
