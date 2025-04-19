package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_role")
    @SequenceGenerator(name = "sequence_role")
    private Long id;

    @Column
    private String name;

    @OneToMany(mappedBy = "role")
    private Set<User> users = new HashSet<>();
}
