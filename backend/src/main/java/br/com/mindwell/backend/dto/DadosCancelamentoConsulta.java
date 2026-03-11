package br.com.mindwell.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosCancelamentoConsulta(
    @NotBlank(message = "O motivo do cancelamento é obrigatório")
    String motivo
) {}