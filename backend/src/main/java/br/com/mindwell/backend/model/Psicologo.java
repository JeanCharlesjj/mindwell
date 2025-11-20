package br.com.mindwell.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity(name = "Psicologo")
@Table(name = "psicologos")
@Getter
@Setter
public class Psicologo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nome;

    @Column(unique = true)
    private String email;

    private String senha;

    private String crp;

    @Column(unique = true)
    private String codigoDeAssociacao;

}
