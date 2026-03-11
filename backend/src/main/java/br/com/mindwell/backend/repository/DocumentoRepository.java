package br.com.mindwell.backend.repository;

import br.com.mindwell.backend.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentoRepository extends JpaRepository<Documento, UUID> {
    List<Documento> findAllByPacienteIdOrderByDataUploadDesc(UUID pacienteId);
}