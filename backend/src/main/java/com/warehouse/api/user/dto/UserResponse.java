package com.warehouse.api.user.dto;

import com.warehouse.enums.UserRole;
import com.warehouse.enums.UserState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String tel;
    private UserRole role;
    private UserState state;
    private String telegram;
    private String memo;
    private LocalDateTime createdAt;

}