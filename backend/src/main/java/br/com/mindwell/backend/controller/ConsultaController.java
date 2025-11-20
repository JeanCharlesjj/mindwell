package br.com.mindwell.backend.controller;

import br.com.mindwell.backend.dto.DadosAgendamentoConsulta;
import br.com.mindwell.backend.dto.DadosDetalhamentoConsulta;
import br.com.mindwell.backend.model.Consulta;
import br.com.mindwell.backend.model.Paciente;
import br.com.mindwell.backend.model.Psicologo;
import br.com.mindwell.backend.model.StatusConsulta;
import br.com.mindwell.backend.repository.ConsultaRepository;
import br.com.mindwell.backend.repository.PacienteRepository;
import br.com.mindwell.backend.repository.PsicologoRepository;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/consultas")
@CrossOrigin(origins = "*")
public class ConsultaController {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private PsicologoRepository psicologoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @PostMapping
    public void agendar(@RequestBody DadosAgendamentoConsulta dados) {
        Psicologo psicologo = psicologoRepository.findById(dados.idPsicologo())
                .orElseThrow(() -> new RuntimeException("Psicólogo não encontrado!"));

        Paciente paciente = pacienteRepository.findById(dados.idPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado!"));

        // O paciente está associado a este psicólogo?
        // Se o psicólogo do paciente for nulo OU o ID for diferente... ERRO!
        if (paciente.getPsicologo() == null || !paciente.getPsicologo().getId().equals(psicologo.getId())) {
            throw new RuntimeException("Este paciente não está associado a este psicólogo!");
        }

        // 3. Criar a Consulta
        Consulta consulta = new Consulta();
        consulta.setPsicologo(psicologo);
        consulta.setPaciente(paciente);
        consulta.setDataHora(dados.dataHora());
        consulta.setStatus(StatusConsulta.AGENDADA);

        // 4. Salvar
        consultaRepository.save(consulta);
    }

    @GetMapping
    public List<DadosDetalhamentoConsulta> listar(
            @RequestParam(required = false) UUID psicologoId,
            @RequestParam(required = false) UUID pacienteId
    ) {
        List<Consulta> consultas;

        if (psicologoId != null) {
            consultas = consultaRepository.findByPsicologoId(psicologoId);
        } else if (pacienteId != null) {
            consultas = consultaRepository.findByPacienteId(pacienteId);
        } else {
            consultas = consultaRepository.findAll();
        }

        // Transforma a lista de Entidades em lista de DTOs
        return consultas.stream()
                .map(DadosDetalhamentoConsulta::new)
                .toList();
    }
}