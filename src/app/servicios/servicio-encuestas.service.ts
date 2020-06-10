import { Injectable } from '@angular/core';
import { MiservicioService } from './miservicio.service';
import { database } from 'firebase';
import { Encuesta } from '../clases/Encuesta';

@Injectable({
  providedIn: 'root'
})
export class ServicioEncuestasService extends MiservicioService{

  constructor() 
  { 
    super();
    if(!database())    
    {
      super.init(); 
    }
  }

  public crear(encuesta)
  {
    database().ref('encuestas')
              .push()
              .then((snapshot) => encuesta.id = snapshot.key)
              .then(() => this.actualizar(encuesta))
              .catch(() => console.info("No se pudo realizar alta"));
  }

  public actualizar(encuesta)
  {
    database().ref('encuestas/' + encuesta.id)
                  .update(encuesta)
                  .then(() => console.info("Actualizacion exitosa"))
                  .catch(() => console.info("No se pudo actualizar"));
  }

  public leer():Encuesta[]
  {
    let turnos ;                                                        
    console.info("Fetch de todas las encuestas");

    database().ref('encuestas').on('value',(snapshot) => {       
        turnos = [];  
        snapshot.forEach((child) =>{
          var data = child.val();
          turnos.push(Encuesta.CrearEncuesta(data.id, data.idTurno, data.idPaciente, data.nombre,
                                            data.edad, data.sexo, data.fechaAtencion,
                                            data.especialidad, data.primeraAtencion,
                                            data.satisfaccion, data.frecuencia, data.recomienda,
                                            data.medioComunicacion, data.educacion));
        });
        console.info("Turnos");
        console.log(turnos);         
        localStorage.setItem('turnos', JSON.stringify(turnos));
    })
    return turnos;
  }

}