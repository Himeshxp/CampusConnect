package com.project.cc.student;
import com.project.cc.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private StudentRepository studentrepository;

    private StudentMapper studentmapper;
    private PasswordEncoder encoder;

    public StudentService(StudentRepository studentrepository, StudentMapper studentmapper, PasswordEncoder encoder) {
        this.studentrepository = studentrepository;
        this.studentmapper = studentmapper;
        this.encoder = encoder;
    }


    public StudentResponseDTO addStudent(CreateStudentRequestDTO studentdto) {
        Student student = studentmapper.toEntity(studentdto);
        student.setPassword(encoder.encode(studentdto.password()));
        Student savedstudent = studentrepository.save(student);
        return studentmapper.toDTO(savedstudent);

    }

    public List<StudentResponseDTO> getStudents() {
        return studentrepository.findAll().stream().map(studentmapper::toDTO).toList();
    }

    public StudentResponseDTO getStudentById(Integer id) {
        return studentrepository.findById(id)
                .map(student -> studentmapper.toDTO(student)).orElseThrow(() -> new RuntimeException("student not found"));
    }


    public void deleteStudentById(Integer id) {
        if (!studentrepository.existsById(id)) {
            throw new ResourceNotFoundException("student not found with id " + id);
        }
        studentrepository.deleteById(id);
    }
}