package com.warehouse.api.client;

import com.warehouse.enums.ClientType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    Optional<Client> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<Client> findByType(ClientType type);
    
    @Query("SELECT c FROM Client c WHERE c.name LIKE %:name%")
    List<Client> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT c FROM Client c WHERE c.phone LIKE %:phone%")
    List<Client> findByPhoneContaining(@Param("phone") String phone);
}