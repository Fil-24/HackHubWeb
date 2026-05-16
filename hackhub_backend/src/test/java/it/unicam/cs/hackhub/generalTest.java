package it.unicam.cs.hackhub;

import it.unicam.cs.hackhub.security.AuthEntryPointJwt;
import it.unicam.cs.hackhub.security.JwtUtil;
import it.unicam.cs.hackhub.service.AccountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// 1. Provide the missing environment variable directly to the test context
@SpringBootTest(properties = {"app.cors.allowed-origins=http://localhost:4200"})
@AutoConfigureMockMvc
class generalTest {

    @Autowired
    private MockMvc mockMvc;

    // 2. Mock the AuthEntryPointJwt to satisfy SecurityConfig's constructor
    @MockitoBean
    private AuthEntryPointJwt authEntryPointJwt;

    @MockitoBean
    private JwtUtil jwtUtil;
    @MockitoBean
    private AccountService accountService;

    private static final String ANGULAR_FRONTEND_URL = "http://localhost:4200";
    private static final String UNKNOWN_URL = "http://sito-hacker-cattivo.com";

    @Test
    void corsShouldAllowAngularFrontendForHackathons() throws Exception {
        mockMvc.perform(options("/api/hackathons")
                        .header("Origin", ANGULAR_FRONTEND_URL)
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", ANGULAR_FRONTEND_URL));
    }

    @Test
    void corsShouldAllowAngularFrontendForSingleHackathon() throws Exception {
        mockMvc.perform(options("/api/hackathons/1")
                        .header("Origin", ANGULAR_FRONTEND_URL)
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", ANGULAR_FRONTEND_URL));
    }

    @Test
    void corsShouldAllowAngularFrontendForTeams() throws Exception {
        mockMvc.perform(options("/api/teams")
                        .header("Origin", ANGULAR_FRONTEND_URL)
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", ANGULAR_FRONTEND_URL));
    }

    @Test
    void corsShouldBlockUnknownOrigins() throws Exception {
        mockMvc.perform(options("/api/hackathons")
                        .header("Origin", UNKNOWN_URL)
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}