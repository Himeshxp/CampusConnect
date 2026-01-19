package com.project.cc.student;

import com.project.cc.staff.Staff;
import com.project.cc.staff.StaffRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private StudentRepository studentRepo;
    @Autowired
    private StaffRepository staffRepo;

    public static class LoginBody {
        public String email;
        public String password;
        public String role;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginBody body, HttpSession session) {

        String email = body.email;
        String password = body.password;
        String role = body.role.toLowerCase();

        if (role.equals("student")) {
            Student student = studentRepo.findByEmail(email);

            if (student == null || !student.getPassword().equals(password)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid student credentials"));
            }

            session.setAttribute("user", student);
            session.setAttribute("role", "student");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "role", "student",
                    "id", student.getId(),
                    "email", student.getEmail(),
                    "name", (student.getFirstName() == null ? "" : student.getFirstName()) +
                            (student.getLastName() == null ? "" : (" " + student.getLastName())),
                    "message", "Student login successful"
            ));
        }

        if (role.equals("staff")) {
            Staff staff = staffRepo.findByEmail(email);

            if (staff == null || !staff.getPassword().equals(password)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid staff credentials"));
            }

            session.setAttribute("user", staff);
            session.setAttribute("role", "staff");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "role", "staff",
                    "id", staff.getId(),
                    "email", staff.getEmail(),
                    "name", (staff.getFirstName() == null ? "" : staff.getFirstName())+(staff.getLastName() == null ? "" : (" " + staff.getLastName())),
                    "message", "Staff login successful"
            ));
        }

        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid role"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Object roleObj = session.getAttribute("role");
        Object userObj = session.getAttribute("user");
        if (roleObj == null || userObj == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "authenticated", false, "message", "Not logged in"));
        }

        String role = String.valueOf(roleObj);

        if ("student".equals(role) && userObj instanceof Student student) {
            String name = (student.getFirstName() == null ? "" : student.getFirstName()) +
                    (student.getLastName() == null ? "" : (" " + student.getLastName()));
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "authenticated", true,
                    "role", "student",
                    "id", student.getId(),
                    "email", student.getEmail(),
                    "name", name
            ));
        }

        if ("staff".equals(role) && userObj instanceof Staff staff) {
            String name = (staff.getFirstName() == null ? "" : staff.getFirstName()) +
                    (staff.getLastName() == null ? "" : (" " + staff.getLastName()));
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "authenticated", true,
                    "role", "staff",
                    "id", staff.getId(),
                    "email", staff.getEmail(),
                    "name", name
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "authenticated", false, "message", "Invalid session"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out"));
    }
}

