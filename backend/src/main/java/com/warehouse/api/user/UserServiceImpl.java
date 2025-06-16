package com.warehouse.api.user;

import com.warehouse.enums.UserRole;
import com.warehouse.enums.UserState;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        logger.info("Creating new user: {}", user.getUsername());
        
        if (userRepository.existsByUsername(user.getUsername())) {
            logger.warn("Username already exists: {}", user.getUsername());
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            logger.warn("Email already exists: {}", user.getEmail());
            throw new RuntimeException("Email already exists");
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        logger.debug("Password encoded for user: {}", user.getUsername());
        
        User savedUser = userRepository.save(user);
        logger.info("User created successfully: {}", savedUser.getUsername());
        
        return savedUser;
    }

    public User updateUser(Long id, User userDetails) {
        logger.info("Updating user with ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });

        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        user.setTel(userDetails.getTel());
        user.setRole(userDetails.getRole());
        user.setState(userDetails.getState());
        user.setTelegram(userDetails.getTelegram());
        user.setMemo(userDetails.getMemo());

        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully: {}", updatedUser.getUsername());
        
        return updatedUser;
    }

    public void deleteUser(Long id) {
        logger.info("Deleting user with ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });
                
        userRepository.delete(user);
        logger.info("User deleted successfully: {}", user.getUsername());
    }

    public User toggleUserStatus(Long id, boolean isActive) {
        logger.info("Toggling status for user ID: {} to {}", id, isActive ? "active" : "inactive");
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });
        
        user.setState(isActive ? UserState.ACTIVE : UserState.INACTIVE);
        User updatedUser = userRepository.save(user);
        logger.info("User status updated successfully: {}", updatedUser.getUsername());
        
        return updatedUser;
    }

    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public List<User> getUsersByState(UserState state) {
        return userRepository.findByState(state);
    }

    public List<User> searchUsersByName(String name) {
        return userRepository.findByNameContaining(name);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}