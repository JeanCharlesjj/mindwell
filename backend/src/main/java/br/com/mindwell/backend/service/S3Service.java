package br.com.mindwell.backend.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private AmazonS3 amazonS3;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public String uploadArquivo(MultipartFile arquivo) {
        try {
            String nomeOriginal = arquivo.getOriginalFilename();
            String extensao = nomeOriginal != null && nomeOriginal.contains(".") 
                    ? nomeOriginal.substring(nomeOriginal.lastIndexOf(".")) 
                    : "";
            String chaveUnica = UUID.randomUUID().toString() + extensao;

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(arquivo.getContentType());
            metadata.setContentLength(arquivo.getSize());

            amazonS3.putObject(bucketName, chaveUnica, arquivo.getInputStream(), metadata);

            return chaveUnica;

        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar o arquivo para upload", e);
        }
    }

    public String gerarUrlSegura(String chaveArquivo) {
        java.util.Date expiracao = new java.util.Date();
        long expTimeMillis = expiracao.getTime();
        expTimeMillis += 1000 * 60 * 60;
        expiracao.setTime(expTimeMillis);

        return amazonS3.generatePresignedUrl(bucketName, chaveArquivo, expiracao).toString();
    }
}