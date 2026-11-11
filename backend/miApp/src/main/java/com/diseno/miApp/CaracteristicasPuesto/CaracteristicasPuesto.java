package com.diseno.miApp.CaracteristicasPuesto;

import com.diseno.miApp.Competencia.Competencia;
import com.diseno.miApp.Puesto.Puesto;
import jakarta.persistence.*;

@Entity
public class CaracteristicasPuesto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer ponderacion;
    @ManyToOne
    @JoinColumn(name ="competencia_id")
    private Competencia competencia;
    @ManyToOne
    @JoinColumn(name="puesto_id")
    private Puesto puesto;
    public CaracteristicasPuesto(){}
    public CaracteristicasPuesto(Long id, Integer ponderacion, Competencia competencia, Puesto puesto) {
        this.id = id;
        this.ponderacion = ponderacion;
        this.competencia = competencia;
        this.puesto = puesto;
    }

    public Competencia getCompetencia() {
        return competencia;
    }

    public void setCompetencia(Competencia competencia) {
        this.competencia = competencia;
    }

    public Integer getPonderacion() {
        return ponderacion;
    }

    public void setPonderacion(Integer ponderacion) {
        this.ponderacion = ponderacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Puesto getPuesto() {
        return puesto;
    }

    public void setPuesto(Puesto puesto) {
        this.puesto = puesto;
    }
}
