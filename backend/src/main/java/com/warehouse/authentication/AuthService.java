package com.warehouse.authentication;

public interface AuthService {

    LoginResponse login(LoginRequest dto);
    LoginResponse getUser(String token);

    String register(RegisterDto dto);
}
