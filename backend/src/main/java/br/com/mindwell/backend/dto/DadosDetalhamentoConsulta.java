package br.com.mindwell.backend.dto;

import br.com.mindwell.backend.model.Consulta;
import br.com.mindwell.backend.model.StatusConsulta;

import java.time.LocalDateTime;
import java.util.UUID;

public record DadosDetalhamentoConsulta(
    UUID id,
    UUID idPsicologo,
    String nomePsicologo,
    UUID idPaciente,
    String nomePaciente,
    LocalDateTime dataHora,
    StatusConsulta status
) {
    public DadosDetalhamentoConsulta(Consulta consulta) {
        this(
            consulta.getId(),
            consulta.getPsicologo().getId(),
            consulta.getPsicologo().getNome(),
            consulta.getPaciente().getId(),
            consulta.getPaciente().getNome(),
            consulta.getDataHora(),
            consulta.getStatus()
        );
    }
}