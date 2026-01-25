package br.com.mindwell.backend.controller;

import br.com.mindwell.backend.dto.DadosAgendamentoConsulta;
import br.com.mindwell.backend.dto.DadosAtualizacaoConsulta;
import br.com.mindwell.backend.dto.DadosDetalhamentoConsulta;
import br.com.mindwell.backend.dto.DadosFinalizacaoConsulta;
import br.com.mindwell.backend.model.Consulta;
import br.com.mindwell.backend.model.Paciente;
import br.com.mindwell.backend.model.Psicologo;
import br.com.mindwell.backend.model.StatusConsulta;
import br.com.mindwell.backend.repository.ConsultaRepository;
import br.com.mindwell.backend.repository.PacienteRepository;
import br.com.mindwell.backend.repository.PsicologoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/consultas")
public class ConsultaController {

    @Autowired
    private ConsultaRepository repository;

    @Autowired
    private PsicologoRepository psicologoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @PostMapping
    public void agendar(@RequestBody DadosAgendamentoConsulta dados) {
        Psicologo psicologo = psicologoRepository.findById(dados.idPsicologo())
                .orElseThrow(() -> new RuntimeException("Psicólogo não encontrado"));

        Paciente paciente = pacienteRepository.findById(dados.idPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        Consulta consulta = new Consulta();
        consulta.setPsicologo(psicologo);
        consulta.setPaciente(paciente);
        consulta.setDataHora(dados.dataHora());
        consulta.setStatus(StatusConsulta.AGENDADA);

        repository.save(consulta);
    }

    @GetMapping
    public List<DadosDetalhamentoConsulta> listar(
            @RequestParam(required = false) UUID psicologoId,
            @RequestParam(required = false) UUID pacienteId,
            @RequestParam(required = false) String nomePaciente
    ) {
        List<Consulta> consultas;

        if (psicologoId != null && nomePaciente != null) {
            consultas = repository.findByPsicologoIdAndPaciente_NomeContainingIgnoreCase(psicologoId, nomePaciente);
        } else if (psicologoId != null) {
            consultas = repository.findByPsicologoId(psicologoId);
        } else if (pacienteId != null) {
            consultas = repository.findByPacienteId(pacienteId);
        } else {
            consultas = repository.findAll();
        }

        return consultas.stream().map(DadosDetalhamentoConsulta::new).toList();
    }

    // --- AQUI ESTAVA O PROBLEMA (FALTAVA ESSE MÉTODO OU ESTAVA ERRADO) ---
    @PutMapping
    public void atualizar(@RequestBody DadosAtualizacaoConsulta dados) {
        Consulta consulta = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        // Atualiza apenas se o dado foi enviado
        if (dados.dataHora() != null) {
            consulta.setDataHora(dados.dataHora());
        }
        if (dados.anotacoes() != null) {
            consulta.setAnotacoes(dados.anotacoes());
        }

        repository.save(consulta);
    }

    // Método para Cancelar
    @PutMapping("/{id}/cancelar")
    public void cancelar(@PathVariable UUID id) {
        Consulta consulta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        consulta.setStatus(StatusConsulta.CANCELADA);
        repository.save(consulta);
    }

    @GetMapping("/{id}")
    public DadosDetalhamentoConsulta detalhar(@PathVariable UUID id) {
        Consulta consulta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        return new DadosDetalhamentoConsulta(consulta);
    }

    @PutMapping("/{id}/iniciar")
    public void iniciarSessao(@PathVariable UUID id) {
        Consulta consulta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        // Só define o início se ainda estiver nulo
        if (consulta.getDataInicioReal() == null) {
            consulta.setDataInicioReal(LocalDateTime.now());
            repository.save(consulta);
        }
    }

    @PutMapping("/{id}/finalizar")
    public void finalizar(@PathVariable UUID id, @RequestBody DadosFinalizacaoConsulta dados) {
        Consulta consulta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        consulta.setAnotacoes(dados.anotacoes());
        consulta.setStatus(StatusConsulta.REALIZADA);
        
        repository.save(consulta);
    }
}