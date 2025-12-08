package br.com.mindwell.backend.dto;

import br.com.mindwell.backend.model.Paciente;
import java.util.UUID;

public record DadosListagemPaciente(UUID id, String nome, String email, String telefone) {
    public DadosListagemPaciente(Paciente paciente) {
        this(paciente.getId(), paciente.getNome(), paciente.getEmail(), paciente.getTelefone());
    }
}