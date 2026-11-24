package com.diseno.miApp.autenticador;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.naming.AuthenticationException;
import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.InitialDirContext;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Hashtable;

/**
 * CU001 paso 5: valida usuario y contraseña del consultor contra el LDAP
 * de la organización.
 *
 * Si se configura {@code ldap.url}, se hace un "bind" simple contra el LDAP
 * usando el DN que resulta de {@code ldap.dn-patron} ({0} = usuario).
 * Si no hay LDAP configurado (entorno de desarrollo), se compara contra el
 * usuario y la contraseña definidos en {@code consultor.usuario-local} y
 * {@code consultor.contrasenia-local}.
 */
@Component
public class ValidadorCredencialesConsultor {

    private final String ldapUrl;
    private final String dnPatron;
    private final String usuarioLocal;
    private final String contraseniaLocal;

    public ValidadorCredencialesConsultor(
            @Value("${ldap.url:}") String ldapUrl,
            @Value("${ldap.dn-patron:uid={0},ou=consultores,dc=empresa,dc=com}") String dnPatron,
            @Value("${consultor.usuario-local:}") String usuarioLocal,
            @Value("${consultor.contrasenia-local:}") String contraseniaLocal) {
        this.ldapUrl = ldapUrl == null ? "" : ldapUrl.trim();
        this.dnPatron = dnPatron;
        this.usuarioLocal = usuarioLocal == null ? "" : usuarioLocal.trim().toUpperCase();
        this.contraseniaLocal = contraseniaLocal == null ? "" : contraseniaLocal;
    }

    /**
     * @param usuario    identificador ya normalizado a mayúsculas.
     * @param contrasenia contraseña en claro.
     * @return true si las credenciales son válidas.
     */
    public boolean esValido(String usuario, String contrasenia) {
        if (!ldapUrl.isEmpty()) {
            return validarContraLdap(usuario, contrasenia);
        }
        if (usuarioLocal.isEmpty() || contraseniaLocal.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No hay un LDAP ni un consultor local configurado. " +
                            "Definí LDAP_URL o CONSULTOR_USUARIO y CONSULTOR_CONTRASENIA");
        }
        return iguales(usuarioLocal, usuario) && iguales(contraseniaLocal, contrasenia);
    }

    private boolean validarContraLdap(String usuario, String contrasenia) {
        Hashtable<String, String> entorno = new Hashtable<>();
        entorno.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
        entorno.put(Context.PROVIDER_URL, ldapUrl);
        entorno.put(Context.SECURITY_AUTHENTICATION, "simple");
        // El usuario ya fue validado con [A-Z0-9._-], así que no puede
        // inyectar caracteres especiales en el DN.
        entorno.put(Context.SECURITY_PRINCIPAL, dnPatron.replace("{0}", usuario));
        entorno.put(Context.SECURITY_CREDENTIALS, contrasenia);
        entorno.put("com.sun.jndi.ldap.connect.timeout", "5000");
        entorno.put("com.sun.jndi.ldap.read.timeout", "5000");
        try {
            new InitialDirContext(entorno).close();
            return true;
        } catch (AuthenticationException e) {
            return false;
        } catch (NamingException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo conectar con el LDAP de la organización", e);
        }
    }

    private static boolean iguales(String esperado, String recibido) {
        return MessageDigest.isEqual(
                esperado.getBytes(StandardCharsets.UTF_8),
                recibido.getBytes(StandardCharsets.UTF_8));
    }
}
