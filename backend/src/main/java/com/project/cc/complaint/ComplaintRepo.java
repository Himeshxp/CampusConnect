package com.project.cc.complaint;
import java.util.List;
import com.project.cc.event.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintRepo extends JpaRepository<Complaints, Integer> {
    List<Complaints> findByStudent_Id(Integer studentId);
}
