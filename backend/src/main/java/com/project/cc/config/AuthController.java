package com.project.cc.config;

import com.project.cc.staff.Staff;
import com.project.cc.staff.StaffRepository;
import com.project.cc.student.Student;
import com.project.cc.student.StudentRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String AUTH_COOKIE_NAME = "campusconnect_auth";

    private final StudentRepository studentRepo;
    private final StaffRepository staffRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:}")
    private String adminEmail;

    @Value("${admin.password:}")
    private String adminPassword;

    public AuthController(StudentRepository studentRepo,
                          StaffRepository staffRepo,
                          JwtUtil jwtUtil,
                          PasswordEncoder passwordEncoder) {
        this.studentRepo = studentRepo;
        this.staffRepo = staffRepo;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public static class LoginBody {
        @Email
        @NotBlank
        public String email;

        @NotBlank
        public String password;

        @NotBlank
        public String role;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginBody body, HttpServletRequest request) {

        String role = body.role.trim().toLowerCase();

        if (role.equals("student")) {
            Student student = studentRepo.findByEmail(body.email);
            if (student == null || !passwordEncoder.matches(body.password, student.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid student credentials"));
            }

            String token = jwtUtil.generateToken(student.getEmail(), "student", student.getId());

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, request).toString())
                    .body(Map.of(
                    "success", true,
                    "role", "student",
                    "id", student.getId(),
                    "email", student.getEmail(),
                    "name", (student.getFirstName() + " " + student.getLastName()).trim()
            ));
        }

        if (role.equals("staff")) {
            Staff staff = staffRepo.findByEmail(body.email);

            if (staff == null || !passwordEncoder.matches(body.password, staff.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid staff credentials"));
            }

            String token = jwtUtil.generateToken(staff.getEmail(), "staff", staff.getId());

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, request).toString())
                    .body(Map.of(
                    "success", true,
                    "role", "staff",
                    "id", staff.getId(),
                    "email", staff.getEmail(),
                    "name", (staff.getFirstName() + " " + staff.getLastName()).trim()
            ));
        }

        if (role.equals("admin")) {
            if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("success", false, "message", "Admin login is not configured"));
            }

            if (!adminEmail.trim().equalsIgnoreCase(body.email.trim()) || !adminPasswordMatches(body.password)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid admin credentials"));
            }

            String token = jwtUtil.generateToken(adminEmail.trim(), "admin", 0);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, request).toString())
                    .body(Map.of(
                            "success", true,
                            "role", "admin",
                            "id", 0,
                            "email", adminEmail.trim(),
                            "name", "Admin"
                    ));
        }

        return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Invalid role"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        if (userId == null || role == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("authenticated", false, "message", "Unauthorized"));
        }

        if ("student".equalsIgnoreCase(role)) {
            Student student = studentRepo.findById(userId).orElse(null);
            if (student == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("authenticated", false, "message", "Account not found"));
            }

            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "id", student.getId(),
                    "email", student.getEmail(),
                    "name", (student.getFirstName() + " " + student.getLastName()).trim(),
                    "role", "student"
            ));
        }

        if ("staff".equalsIgnoreCase(role)) {
            Staff staff = staffRepo.findById(userId).orElse(null);
            if (staff == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("authenticated", false, "message", "Account not found"));
            }

            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "id", staff.getId(),
                    "email", staff.getEmail(),
                    "name", (staff.getFirstName() + " " + staff.getLastName()).trim(),
                    "role", "staff"
            ));
        }

        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "id", 0,
                    "email", adminEmail == null || adminEmail.isBlank() ? "admin" : adminEmail.trim(),
                    "name", "Admin",
                    "role", "admin"
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("authenticated", false, "message", "Unauthorized"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request
    ) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        if (token == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (AUTH_COOKIE_NAME.equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token != null && !token.isBlank()) {
            jwtUtil.revokeToken(token);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearAuthCookie(request).toString())
                .body(Map.of("success", true));
    }

    private ResponseCookie buildAuthCookie(String token, HttpServletRequest request) {
        return ResponseCookie.from(AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(60 * 60 * 12)
                .build();
    }

    private ResponseCookie clearAuthCookie(HttpServletRequest request) {
        return ResponseCookie.from(AUTH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    private boolean adminPasswordMatches(String rawPassword) {
        String configuredPassword = adminPassword.trim();
        if (configuredPassword.startsWith("$2a$")
                || configuredPassword.startsWith("$2b$")
                || configuredPassword.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, configuredPassword);
        }
        return configuredPassword.equals(rawPassword);
    }
}
