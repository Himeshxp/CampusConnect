package com.project.cc.staff;

import org.springframework.web.bind.annotation.RestController;

@RestController
public class StaffController {
    public StaffController(StaffRepository staffrepository) {
        this.staffrepository = staffrepository;
    }

    private final StaffRepository staffrepository;
}
