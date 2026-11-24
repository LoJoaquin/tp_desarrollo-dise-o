package com.diseno.miApp.JWT;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final long DURACION_TOKEN_MS = 1000L * 60 * 60 * 24;
    private static final String CLAIM_PERFIL = "perfil";
    private final String secretKey;

    public JwtService(@Value("${seguridad.jwt.secret}") String secretKey) {
        if (secretKey == null || secretKey.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException(
                    "JWT_SECRET debe tener al menos 32 bytes"
            );
        }
        this.secretKey = secretKey;
    }

    public String generarToken(Long idCandidato) {
        return Jwts.builder()
                .subject(idCandidato.toString())
                .claim(CLAIM_PERFIL, "CANDIDATO")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + DURACION_TOKEN_MS))
                .signWith(getKey())
                .compact();
    }

    public String generarTokenConsultor(String usuario) {
        return Jwts.builder()
                .subject(usuario)
                .claim(CLAIM_PERFIL, "CONSULTOR")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + DURACION_TOKEN_MS))
                .signWith(getKey())
                .compact();
    }

    public Claims validarToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }
}
