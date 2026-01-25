package br.com.mindwell.backend.dto;

import java.util.UUID;

public record DadosAtualizacaoPsicologo(
    UUID id,
    String nome,
    String email,
    Integer tempoSessao
) {}