package com.project.cc.config;

import com.project.cc.staff.Staff;
import com.project.cc.staff.StaffRepository;
import com.project.cc.student.Student;
import com.project.cc.student.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final StudentRepository studentRepo;
    private final StaffRepository staffRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

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
        public String email;
        public String password;
        public String role;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginBody body) {

        if (body.role == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Role is required"));
        }

        String role = body.role.toLowerCase();

        if (role.equals("student")) {
            Student student = studentRepo.findByEmail(body.email);

            if (student == null || !passwordEncoder.matches(body.password, student.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid student credentials"));
            }

            String token = jwtUtil.generateToken(student.getEmail(), "student", student.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
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

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "role", "staff",
                    "id", staff.getId(),
                    "email", staff.getEmail(),
                    "name", (staff.getFirstName() + " " + staff.getLastName()).trim()
            ));
        }

        return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Invalid role"));
    }
}