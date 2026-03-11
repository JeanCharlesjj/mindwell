package br.com.mindwell.backend.controller;

import br.com.mindwell.backend.dto.DadosDocumento;
import br.com.mindwell.backend.model.Documento;
import br.com.mindwell.backend.model.Paciente;
import br.com.mindwell.backend.model.Psicologo;
import br.com.mindwell.backend.repository.DocumentoRepository;
import br.com.mindwell.backend.repository.PacienteRepository;
import br.com.mindwell.backend.repository.PsicologoRepository;
import br.com.mindwell.backend.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/documentos")
public class DocumentoController {

    @Autowired
    private DocumentoRepository repository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private PsicologoRepository psicologoRepository;

    @Autowired
    private S3Service s3Service;

    @PostMapping("/upload")
    public ResponseEntity<Void> fazerUpload(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("titulo") String titulo,
            @RequestParam("pacienteId") UUID pacienteId,
            @RequestParam("psicologoId") UUID psicologoId) {

        String chaveS3 = s3Service.uploadArquivo(arquivo);

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        Psicologo psicologo = psicologoRepository.findById(psicologoId)
                .orElseThrow(() -> new RuntimeException("Psicólogo não encontrado"));

        Documento doc = new Documento();
        doc.setTitulo(titulo);
        doc.setUrlArquivo(chaveS3);
        doc.setPaciente(paciente);
        doc.setPsicologo(psicologo);
        repository.save(doc);

        return ResponseEntity.status(201).build();
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<DadosDocumento>> listarDocumentos(@PathVariable UUID pacienteId) {
        
        List<Documento> documentos = repository.findAllByPacienteIdOrderByDataUploadDesc(pacienteId);
        
        List<DadosDocumento> listaDto = documentos.stream()
                .map(doc -> {
                    String urlSegura = s3Service.gerarUrlSegura(doc.getUrlArquivo());
                    return new DadosDocumento(doc, urlSegura);
                })
                .toList();

        return ResponseEntity.ok(listaDto);
    }
}