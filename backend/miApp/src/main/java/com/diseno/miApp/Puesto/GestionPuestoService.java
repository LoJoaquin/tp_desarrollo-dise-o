package com.diseno.miApp.Puesto;

import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuesto;
import com.diseno.miApp.Competencia.CompetenciaService;
import com.diseno.miApp.Empresa.EmpresaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;

@Service
public class GestionPuestoService {

    private final PuestoService puestoService;
    private final EmpresaService empresaService;
    private final CompetenciaService competenciaService;

    public GestionPuestoService(
            PuestoService puestoService,
            EmpresaService empresaService,
            CompetenciaService competenciaService) {
        this.puestoService = puestoService;
        this.empresaService = empresaService;
        this.competenciaService = competenciaService;
    }

    @Transactional
    public Puesto crear(PuestoCrearRequest request) {
        if (request == null || request.getEmpresa() == null
                || request.getEmpresa().getId() == null) {
            throw errorSolicitud("Debe indicar la empresa del puesto");
        }
        return puestoService.crearPuesto(
                request,
                empresaService.buscarPorId(request.getEmpresa().getId()),
                resolverCaracteristicas(request.getCaracteristicasPuesto())
        );
    }

    @Transactional
    public Puesto modificar(Long id, PuestoModificarRequest request) {
        if (request == null) {
            throw errorSolicitud("Debe enviar los datos para modificar el puesto");
        }
        var empresa = request.getEmpresa() == null
                ? null
                : request.getEmpresa().getId() == null
                    ? null
                    : empresaService.buscarPorId(request.getEmpresa().getId());
        if (request.getEmpresa() != null && empresa == null) {
            throw errorSolicitud("Debe indicar el ID de la empresa");
        }
        List<CaracteristicasPuesto> caracteristicas =
                request.getCaracteristicasPuesto() == null
                        ? null
                        : resolverCaracteristicas(request.getCaracteristicasPuesto());
        return puestoService.modificarPuesto(id, request, empresa, caracteristicas);
    }

    private List<CaracteristicasPuesto> resolverCaracteristicas(
            List<CaracteristicasPuesto> recibidas) {
        if (recibidas == null) {
            throw errorSolicitud("Debe incluir las características del puesto");
        }
        List<CaracteristicasPuesto> resueltas = new ArrayList<>();
        for (CaracteristicasPuesto recibida : recibidas) {
            if (recibida == null || recibida.getCompetencia() == null
                    || recibida.getCompetencia().getId() == null) {
                throw errorSolicitud("Cada característica debe indicar una competencia");
            }
            Integer ponderacion = recibida.getPonderacion();
            if (ponderacion == null || ponderacion < 0 || ponderacion > 10) {
                throw errorSolicitud(
                        "La ponderación debe estar entre 0 y 10"
                );
            }
            CaracteristicasPuesto caracteristica = new CaracteristicasPuesto();
            caracteristica.setPonderacion(ponderacion);
            caracteristica.setCompetencia(
                    competenciaService.buscarPorId(recibida.getCompetencia().getId())
            );
            resueltas.add(caracteristica);
        }
        return resueltas;
    }
}
