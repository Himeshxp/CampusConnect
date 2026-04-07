package com.project.cc.complaint;

import com.project.cc.ComplaintStatus;


public class StatusUpdateRequest {
    private ComplaintStatus status;

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

}
