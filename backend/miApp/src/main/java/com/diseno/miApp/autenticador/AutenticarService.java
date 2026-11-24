package com.diseno.miApp.autenticador;

import com.diseno.miApp.Candidato.Candidato;
import com.diseno.miApp.Candidato.CandidatoRepository;
import com.diseno.miApp.JWT.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;

@Service
public class AutenticarService {
    private final CandidatoRepository candidatoRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ValidadorCredencialesConsultor validadorConsultor;
    public AutenticarService(
            CandidatoRepository candidatoRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            ValidadorCredencialesConsultor validadorConsultor) {
        this.validadorConsultor = validadorConsultor;
        this.jwtService = jwtService;
        this.candidatoRepository = candidatoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AutenticarResponse autenticarCandidato(
            AutenticarCandidatoRequest request) {
        if (request == null || request.tipo() == null
                || request.documento() == null
                || request.documento().isBlank()
                || request.contrasenia() == null
                || request.contrasenia().isBlank()) {
            throw errorSolicitud(
                    "Ingresá tipo y número de documento y contraseña");
        }

        Candidato candidato = candidatoRepository
                .findFirstByTipoDocumentoAndNumeroDocumentoAndEstaActivoTrue(
                        request.tipo(), request.documento().trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Tipo, documento o contraseña no válidos"));

        if (candidato.getContrasenia() == null
                || !passwordEncoder.matches(
                        request.contrasenia(), candidato.getContrasenia())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Tipo, documento o contraseña no válidos");
        }

        return new AutenticarResponse(
                jwtService.generarToken(candidato.getId()),
                candidato.getId(),
                candidato.getNombre() + " " + candidato.getApellido());
    }

    // Requerimientos especiales del CU001: el identificador se toma siempre
    // en mayúsculas; el LDAP admite hasta 15 caracteres de usuario y 20 de
    // contraseña.
    private static final int LONGITUD_MAXIMA_USUARIO = 15;
    private static final int LONGITUD_MAXIMA_CONTRASENIA = 20;
    private static final String MENSAJE_CONSULTOR_INVALIDO =
            "El usuario o la contraseña no son válidos";

    public AutenticarConsultorResponse autenticarConsultor(
            AutenticarConsultorRequest request) {
        if (request == null || request.nombreUsuario() == null
                || request.nombreUsuario().isBlank()
                || request.contrasenia() == null
                || request.contrasenia().isEmpty()) {
            throw errorSolicitud("Ingresá el nombre de usuario y la contraseña");
        }

        String usuario = request.nombreUsuario().trim().toUpperCase();
        String contrasenia = request.contrasenia();

        if (usuario.length() > LONGITUD_MAXIMA_USUARIO
                || contrasenia.length() > LONGITUD_MAXIMA_CONTRASENIA
                || !usuario.matches("[A-Z0-9._-]+")
                || !validadorConsultor.esValido(usuario, contrasenia)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, MENSAJE_CONSULTOR_INVALIDO);
        }

        return new AutenticarConsultorResponse(
                jwtService.generarTokenConsultor(usuario),
                usuario,
                "CONSULTOR");
    }
}
