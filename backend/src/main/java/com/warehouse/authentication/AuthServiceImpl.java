package com.warehouse.authentication;

import com.warehouse.api.user.User;
import com.warehouse.api.user.UserRepository;
import com.warehouse.enums.UserState;
import com.warehouse.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(LoginRequest req) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                req.getUsername(),
                req.getPassword()
        ));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        Optional<User> userOptional = userRepository.findByUsername(req.getUsername());

        LoginResponse loginResponse = new LoginResponse();

        if(userOptional.isPresent()){
            User loggedInUser = userOptional.get();
            loginResponse.setUser(loggedInUser);
        }

        loginResponse.setToken(token);

        return loginResponse;
    }

    @Override
    public LoginResponse getUser(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); // Remove "Bearer " prefix
            // Extract user info from the token using JwtTokenProvider
            String username = jwtTokenProvider.getUsername(token);
            Optional<User> userOptional = userRepository.findByUsername(username);
            LoginResponse loginResponse = new LoginResponse();
            if(userOptional.isPresent()){
                User loggedInUser = userOptional.get();
                loginResponse.setUser(loggedInUser);
            }else {
                // User not found in the database
                throw new IllegalArgumentException("User not found");
            }
            loginResponse.setToken(token);
            return loginResponse;
        } else {
            // Invalid token format
            throw new IllegalArgumentException("Invalid token format");
        }
    }

    @Override
    public String register(RegisterDto dto) {

        User newUser = new User();

        newUser.setUsername(dto.getUsername());
        newUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        newUser.setFullName(dto.getFullName());
        newUser.setEmail("");
        newUser.setTel("");
        newUser.setMemo("");
        newUser.setRole(dto.getRole());

        newUser.setState(UserState.ACTIVE);
        newUser.setCreatedBy("admin");
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setModifiedBy(null);
        newUser.setModifiedAt(null);

        User createdUser = userRepository.save(newUser);

        return createdUser.getUserId().toString();
    }

}
