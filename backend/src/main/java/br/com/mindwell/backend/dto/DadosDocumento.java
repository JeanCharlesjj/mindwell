package br.com.mindwell.backend.dto;

import br.com.mindwell.backend.model.Documento;
import java.time.LocalDateTime;
import java.util.UUID;

public record DadosDocumento(
        UUID id, 
        String titulo, 
        String urlAcesso,
        LocalDateTime dataUpload, 
        String nomePsicologo
) {
    public DadosDocumento(Documento doc, String urlAcesso) {
        this(doc.getId(), doc.getTitulo(), urlAcesso, doc.getDataUpload(), doc.getPsicologo().getNome());
    }
}