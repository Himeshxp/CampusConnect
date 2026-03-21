package com.project.cc.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;


// handling the global exception
@ControllerAdvice
public class GlobalExceptionHandler {

    // Handling Validation Errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex)
    {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach((error) ->
            errors.put(error.getField(), error.getDefaultMessage()));
        Map<String,Object> response = new HashMap<>();
        response.put("message", "validation error");
        response.put("errors", errors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Handling custom not found exception
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex){
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "resource not found");
        return new ResponseEntity<>(errors, HttpStatus.NOT_FOUND);
    }
    // handling generic errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex)
    {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "Something went wrong");
        return new ResponseEntity<>(errors, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
