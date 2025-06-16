package com.warehouse.api.user;

import com.warehouse.auditing.Auditable;
import com.warehouse.enums.UserRole;
import com.warehouse.enums.UserState;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "user")
public class User extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(unique = true)
    private String username;

    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Email
    @NotBlank
    @Size(max = 100)
    @Column(unique = true)
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @Size(max = 20)
    private String tel;

    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.ISHCHI;

    @Enumerated(EnumType.STRING)
    private UserState state = UserState.ACTIVE;

    @Size(max = 100)
    private String telegram;

    @Size(max = 500)
    private String memo;
}