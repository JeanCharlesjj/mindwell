package br.com.mindwell.backend.dto;

public record DadosCadastroPsicologo(
    String nome,
    String email,
    String senha,
    String crp
) {
}