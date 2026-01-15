package br.com.mindwell.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record DadosAtualizacaoConsulta(
    UUID id,
    LocalDateTime dataHora,
    String anotacoes
) {
}