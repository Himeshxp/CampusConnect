package com.project.cc.student;

import org.springframework.stereotype.Component;

@Component
public class StudentMapper {

    // CreateStudentRequestDTO
    //Request to Entity
    public Student toEntity(CreateStudentRequestDTO dto){
        Student student = new Student();
        student.setFirstName(dto.firstName());
        student.setLastName(dto.lastName());
        student.setEmail(dto.email());
        student.setPassword(dto.password()); // hashing
        return student;
    }

    //ResponseDTO
    //Entity to Response
    public StudentResponseDTO toDTO(Student student){
        return new StudentResponseDTO(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail()
        );
    }
}
