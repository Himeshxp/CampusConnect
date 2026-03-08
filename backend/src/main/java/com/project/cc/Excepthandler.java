package com.project.cc;

import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@RestControllerAdvice
public class Excepthandler {
 @ResponseStatus(HttpStatus.NOT_FOUND)
    public class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(Integer id) {
            super("Resource Not Found with id " + id);
        }
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleException(DataIntegrityViolationException ex, HttpRequest request) {
     ErrorResponse error= new ErrorResponse(
             LocalDateTime.now(), HttpStatus.CONFLICT.value(),
             "Database error", "A db error occured ", request.getURI()) {
         @Override
         public HttpStatusCode getStatusCode() {
             return null;
         }

         @Override
         public ProblemDetail getBody() {
             return null;
         }
     };
      return ResponseEntity.status(HttpStatus.CONFLICT).body(error);

    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex, HttpRequest request) {
     ErrorResponse error= new ErrorResponse(LocalDateTime.now(),
             HttpStatus.INTERNAL_SERVER_ERROR,
             "Error",
             "Internal Server error",
             request.getURI()) {
         @Override
         public HttpStatusCode getStatusCode() {
             return null;
         }

         @Override
         public ProblemDetail getBody() {
             return null;
         }
     };
     return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

}
