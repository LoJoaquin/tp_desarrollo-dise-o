package com.diseno.miApp.Pregunta;

import com.diseno.miApp.Factor.Factor;
import com.diseno.miApp.OpcionRespuesta.OpcionRespuesta;
import jakarta.persistence.*;

@Entity
public class Pregunta {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn (name="factor_id")
    private Factor factor;
    @Column(length = PreguntaValidacionConstantes.MAX_NOMBRE_PREGUNTA)
    private String name;

    @Column(length = PreguntaValidacionConstantes.MAX_TEXTO_PREGUNTA)
    private String textoPregunta;

    @Column(length = PreguntaValidacionConstantes.MAX_DESCRIPCION)
    private String descripcion;
    private Boolean estaActivo;
    @ManyToOne
    @JoinColumn (name="opcion_respuesta_id")
    private OpcionRespuesta opcionRespuesta;
    public Pregunta (){}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Factor getFactor() {
        return factor;
    }

    public void setFactor(Factor factor) {
        this.factor = factor;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTextoPregunta() {
        return textoPregunta;
    }

    public void setTextoPregunta(String textoPregunta) {
        this.textoPregunta = textoPregunta;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Boolean getEstaActivo() {
        return estaActivo;
    }

    public void setEstaActivo(Boolean estaActivo) {
        this.estaActivo = estaActivo;
    }

    public OpcionRespuesta getOpcionRespuesta() {
        return opcionRespuesta;
    }

    public void setOpcionRespuesta(OpcionRespuesta opcionRespuesta) {
        this.opcionRespuesta = opcionRespuesta;
    }
}
