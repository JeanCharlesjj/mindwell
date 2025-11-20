package br.com.mindwell.backend.dto;

public record DadosCadastroPaciente(
    String nome,
    String email,
    String senha,
    String telefone,
    String codigoPsicologo
) {
}