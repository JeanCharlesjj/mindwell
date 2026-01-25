package br.com.mindwell.backend.dto;

import java.util.UUID;

public record DadosToken(UUID id, String nome, String tipo) {
}