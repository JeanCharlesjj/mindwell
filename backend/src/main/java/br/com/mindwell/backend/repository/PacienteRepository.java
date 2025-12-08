package br.com.mindwell.backend.repository;

import br.com.mindwell.backend.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    Optional<Paciente> findByEmail(String email);

    List<Paciente> findByPsicologoId(UUID psicologoId);

    List<Paciente> findByPsicologoIdAndNomeContainingIgnoreCase(UUID psicologoId, String nome);
}