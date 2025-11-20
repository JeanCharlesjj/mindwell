package br.com.mindwell.backend.controller;

import br.com.mindwell.backend.dto.DadosCadastroPsicologo;
import br.com.mindwell.backend.model.Psicologo;
import br.com.mindwell.backend.repository.PsicologoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/psicologos")
public class PsicologoController {

    @Autowired
    private PsicologoRepository repository;

    @PostMapping
    public void cadastrar(@RequestBody DadosCadastroPsicologo dados) {
        Psicologo psicologo = new Psicologo();
        
        psicologo.setNome(dados.nome());
        psicologo.setEmail(dados.email());
        psicologo.setSenha(dados.senha()); // Futuramente criptografaremos aqui
        psicologo.setCrp(dados.crp());
        
        // Gerando o código único de associação (8 caracteres aleatórios)
        psicologo.setCodigoDeAssociacao(UUID.randomUUID().toString().substring(0, 8));

        repository.save(psicologo);
    }
}