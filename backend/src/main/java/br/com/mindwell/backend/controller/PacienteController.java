package br.com.mindwell.backend.controller;

import br.com.mindwell.backend.dto.DadosCadastroPaciente;
import br.com.mindwell.backend.dto.DadosToken;
import br.com.mindwell.backend.model.Paciente;
import br.com.mindwell.backend.model.Psicologo;
import br.com.mindwell.backend.repository.PacienteRepository;
import br.com.mindwell.backend.repository.PsicologoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/pacientes")
@CrossOrigin(origins = "*")
public class PacienteController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private PsicologoRepository psicologoRepository;

    @PostMapping("/login")
    public DadosToken login(@RequestBody br.com.mindwell.backend.dto.DadosLogin dados) {
        Paciente paciente = pacienteRepository.findByEmail(dados.email())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        if (!paciente.getSenha().equals(dados.senha())) {
            throw new RuntimeException("Senha incorreta");
        }

        return new DadosToken(paciente.getId(), paciente.getNome());
    }

    @PostMapping
    public void cadastrar(@RequestBody DadosCadastroPaciente dados) {
        // 1. Buscar o Psicólogo pelo código informado
        Optional<Psicologo> psicologoOptional = psicologoRepository.findByCodigoDeAssociacao(dados.codigoPsicologo());

        if (psicologoOptional.isEmpty()) {
            throw new RuntimeException("Psicólogo não encontrado com esse código!");
        }

        // 2. Criar o Paciente
        Paciente paciente = new Paciente();
        paciente.setNome(dados.nome());
        paciente.setEmail(dados.email());
        paciente.setSenha(dados.senha());
        paciente.setTelefone(dados.telefone());
        
        // 3. Fazer a associação
        paciente.setPsicologo(psicologoOptional.get());

        // 4. Salvar
        pacienteRepository.save(paciente);
    }
}