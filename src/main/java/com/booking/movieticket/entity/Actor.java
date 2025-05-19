package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "actors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Actor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_actor")
    @SequenceGenerator(name = "sequence_actor")
    @Column(name = "actor_id")
    private Long id;

    @Column(name = "real_name")
    private String realName;

    @Column(name = "actor_name")
    private String actorName;

    @JsonIgnore
    @ManyToMany(mappedBy = "actors")
    private Set<Movie> movies = new HashSet<>();
}
