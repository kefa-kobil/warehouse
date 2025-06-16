package com.warehouse.api.user;

import com.warehouse.enums.UserRole;
import com.warehouse.enums.UserState;

import java.util.List;
import java.util.Optional;

public interface UserService {

    public List<User> getAllUsers();
    public Optional<User> getUserById(Long id);
    public Optional<User> getUserByUsername(String username);
    public Optional<User> getUserByEmail(String email);

    public User createUser(User user);

    public User updateUser(Long id, User userDetails);

    public void deleteUser(Long id);

    public User toggleUserStatus(Long id, boolean isActive);

    public List<User> getUsersByRole(UserRole role);

    public List<User> getUsersByState(UserState state);

    public List<User> searchUsersByName(String name);

    public boolean existsByUsername(String username);

    public boolean existsByEmail(String email);

}