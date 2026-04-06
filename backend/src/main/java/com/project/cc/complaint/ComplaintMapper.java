package com.project.cc.complaint;

import com.project.cc.ComplaintStatus;
import com.project.cc.student.Student;

public class ComplaintMapper {

    // taking from the user
    public Complaints toEntity(ComplaintRequestDTO complaintdto, Student student) {
      Complaints complaints = new Complaints();
      complaints.setTitle(complaintdto.title());
      complaints.setCategory(complaintdto.category());
      complaints.setDescription(complaintdto.description());
      complaints.setStudent(student);
      return complaints;
    }

    // responding to user
    public ComplaintResponseDTO toDTO(Complaints complaints){
     return new ComplaintResponseDTO(
             complaints.getId(),
             complaints.getTitle(),
             complaints.getCategory(),
             complaints.getDescription(),
             complaints.getComplaintStatus(),
             complaints.getStudent().getFirstName() +complaints.getStudent().getLastName(),
             complaints.getCreatedAt()
     );
    }
}
