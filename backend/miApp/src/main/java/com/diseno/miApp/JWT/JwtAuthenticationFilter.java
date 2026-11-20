package com.diseno.miApp.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization != null && authorization.startsWith("Bearer ")) {
            autenticarSiEsCandidato(authorization.substring(7));
        }
        filterChain.doFilter(request, response);
    }

    private void autenticarSiEsCandidato(String token) {
        try {
            Claims claims = jwtService.validarToken(token);
            String perfil = claims.get("perfil", String.class);
            String idCandidato = claims.getSubject();
            if (!"CANDIDATO".equals(perfil) || idCandidato == null
                    || idCandidato.isBlank()) {
                return;
            }

            var autenticacion = new UsernamePasswordAuthenticationToken(
                    idCandidato,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_CANDIDATO"))
            );
            SecurityContextHolder.getContext().setAuthentication(autenticacion);
        } catch (JwtException | IllegalArgumentException ignored) {
            SecurityContextHolder.clearContext();
        }
    }
}
