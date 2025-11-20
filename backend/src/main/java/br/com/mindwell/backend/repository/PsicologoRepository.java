package br.com.mindwell.backend.repository;

import br.com.mindwell.backend.model.Psicologo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PsicologoRepository extends JpaRepository<Psicologo, UUID> {
    
    Optional<Psicologo> findByCodigoDeAssociacao(String codigoDeAssociacao);

    Optional<Psicologo> findByEmail(String email);
}