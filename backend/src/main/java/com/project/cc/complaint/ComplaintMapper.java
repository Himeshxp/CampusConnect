package com.project.cc.complaint;

import com.project.cc.ComplaintStatus;
import com.project.cc.student.Student;
import org.springframework.stereotype.Component;

@Component
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
    public ComplaintResponseDTO toDTO(Complaints complaint){
        String studentname=complaint.getStudent()!=null
                ?
                complaint.getStudent().getFirstName()+ " " + complaint.getStudent().getLastName():null;
     return new ComplaintResponseDTO(
             complaint.getId(),
             complaint.getTitle(),
             complaint.getCategory(),
             complaint.getDescription(),
             complaint.getComplaintStatus(),
             studentname,
             complaint.getCreatedAt()
     );
    }
}
