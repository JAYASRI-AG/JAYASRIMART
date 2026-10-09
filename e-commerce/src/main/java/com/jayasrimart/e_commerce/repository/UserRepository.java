package com.jayasrimart.e_commerce.repository;

import com.jayasrimart.e_commerce.entity.Role;
import com.jayasrimart.e_commerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
}
