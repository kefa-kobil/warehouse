package com.warehouse.api.user;

import com.warehouse.api.user.dto.CreateUserRequest;
import com.warehouse.api.user.dto.UpdateUserRequest;
import com.warehouse.api.user.dto.UserResponse;
import com.warehouse.enums.UserRole;
import com.warehouse.enums.UserState;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {


    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> userResponses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(convertToUserResponse(user));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setTel(request.getTel());
            user.setRole(request.getRole());
            user.setState(request.getState() != null ? request.getState() : UserState.ACTIVE);
            user.setTelegram(request.getTelegram());
            user.setMemo(request.getMemo());

            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(Map.of("success", true, "user", convertToUserResponse(createdUser)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateUserRequest request) {
        User userDetails = new User();
        userDetails.setFullName(request.getFullName());
        userDetails.setEmail(request.getEmail());
        userDetails.setTel(request.getTel());
        userDetails.setRole(request.getRole());
        userDetails.setState(request.getState());
        userDetails.setTelegram(request.getTelegram());
        userDetails.setMemo(request.getMemo());

        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id,
                                                        @RequestBody Map<String, Boolean> request) {
        boolean isActive = request.get("isActive");
        User updatedUser = userService.toggleUserStatus(id, isActive);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.getUsersByRole(role);
        List<UserResponse> userResponses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String name) {
        List<User> users = userService.searchUsersByName(name);
        List<UserResponse> userResponses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getTel(),
                user.getRole(),
                user.getState(),
                user.getTelegram(),
                user.getMemo(),
                user.getCreatedAt()
        );
    }
}