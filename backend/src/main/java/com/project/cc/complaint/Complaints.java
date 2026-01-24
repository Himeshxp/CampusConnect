package com.project.cc.complaint;

import com.project.cc.student.Student;
import jakarta.persistence.*;
import com.project.cc.ComplaintStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@Entity
public class Complaints {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String title;
    private String category;
    private String description;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus complaintStatus=ComplaintStatus.PENDING;

    @ManyToOne(fetch = FetchType.EAGER)
    private Student student;
    // Many complaints by a single student
    private LocalDateTime createdAt=LocalDateTime.now();
    public Complaints() {}

    public Complaints(int id, String title, String description) {
        this.id = id;
        this.title = title;
        this.description = description;
    }



    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }



}
