import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/clases/Usuario';
import { MiservicioService } from 'src/app/servicios/miservicio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  public usuario: Usuario;
  public mostrarBarra : boolean = false;

  constructor() 
  {
    
  }

  ngOnInit(): void
  {
    this.usuario = JSON.parse(localStorage.getItem("usuario-logueado"));

    if(this.usuario != null)
    {
      this.mostrarBarra = true;
    }
  }

  logout()
  {
    MiservicioService.cerrarSesion(); 
    
  }



}