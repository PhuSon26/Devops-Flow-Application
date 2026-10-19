package devops.demo;

import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "application", "DevOps Demo API",
            "message", "Hello from Kubernetes!",
            "version", "1.0.0",
            "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/api/info")
    public Map<String, Object> info() {
        return Map.of(
            "application", "DevOps Demo API",
            "purpose", "Personal CI/CD and Kubernetes learning project",
            "pipeline", "GitHub -> Jenkins -> Maven -> Docker -> Trivy -> Argo CD -> Kubernetes"
        );
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
