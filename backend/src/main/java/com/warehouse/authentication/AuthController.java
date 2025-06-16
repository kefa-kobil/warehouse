package com.warehouse.authentication;


import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private AuthService authService;

    // Build Login REST API
    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse login(
            @RequestBody LoginRequest dto){
        return authService.login(dto);
    }

    // Build Login REST API
    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse getUser(@RequestHeader("Authorization") String token){
        return authService.getUser(token);
    }


    // Build Register REST API
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.OK)
    public String register(
            @RequestBody RegisterDto dto){
        return authService.register(dto);
    }


}
