package br.com.mindwell.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name = "Documento")
@Table(name = "documentos")
@Getter
@Setter
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "psicologo_id")
    private Psicologo psicologo;

    private String titulo;
    
    @Column(length = 1000)
    private String urlArquivo;
    
    private LocalDateTime dataUpload = LocalDateTime.now();
}